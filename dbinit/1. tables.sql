/*
----------------------
        TIETOTYYPIT 
----------------------
*/

/*
    Tietotyyppi percentage, joka on desimaaliluku välillä 0-1.
    Tarkoitettu kaikkiean prosenttien (alv, alennukset) tallentamiseen.
    Tällä hetkellä rajattu 3 desimaaliin, mutta tarvittaessa voidaan muuttaa.
*/
CREATE DOMAIN percentage AS NUMERIC(4, 3) CHECK (VALUE >= 0 AND VALUE <= 1);


/*
----------------------
        TAULUT
----------------------
*/
CREATE TABLE asiakas (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nimi TEXT NOT NULL,
    osoite TEXT NOT NULL,
    postinumero TEXT NOT NULL,
    postitoimipaikka TEXT NOT NULL,
    sahkoposti TEXT,
    puhelinnumero TEXT
);

CREATE TABLE tyokohde (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tyyppi TEXT NOT NULL,
    osoite TEXT NOT NULL,
    postinumero TEXT NOT NULL,
    postitoimipaikka TEXT NOT NULL
);

CREATE TABLE urakka (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lahtohinta NUMERIC(10, 2),
    aleprosentti percentage NOT NULL DEFAULT 0,
    alv_prosentti percentage NOT NULL,
    korotusprosentti percentage NOT NULL DEFAULT 0,
    hinta NUMERIC(10, 2) GENERATED ALWAYS AS (lahtohinta * (1 - aleprosentti) * (1 + korotusprosentti)) STORED, -- alennuksen ja korotuksen jälkeinen hinta
    alv NUMERIC(10, 2) GENERATED ALWAYS AS (lahtohinta * (1 - aleprosentti) * (1 + korotusprosentti) * alv_prosentti) STORED,
    kotitalousvahennys NUMERIC(10, 2) GENERATED ALWAYS AS (lahtohinta * (1 - aleprosentti) * (1 + korotusprosentti) * (1 + alv_prosentti)) STORED
);

CREATE TABLE tyosuoritus (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tyokohde_id INT NOT NULL,
    urakka_id INT,
    aloitus_pvm DATE NOT NULL DEFAULT CURRENT_DATE,
    asiakas_id INT NOT NULL,
    tila TEXT NOT NULL,
    FOREIGN KEY (tyokohde_id) REFERENCES tyokohde(id),
    FOREIGN KEY (urakka_id) REFERENCES urakka(id),
    FOREIGN KEY (asiakas_id) REFERENCES asiakas(id)
);

CREATE TABLE tuntihintatyyppi (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tyyppi TEXT NOT NULL,
    tuntihinta NUMERIC(10, 2) NOT NULL
);

CREATE TABLE tuntihinta (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tyosuoritus_id INT NOT NULL,
    tuntihintatyyppi_id INT NOT NULL,
    pvm DATE NOT NULL DEFAULT CURRENT_DATE,
    alv_prosentti percentage NOT NULL DEFAULT 0.24,
    aleprosentti percentage NOT NULL DEFAULT 0.0,
    tunnit INT NOT NULL,
    FOREIGN KEY (tyosuoritus_id) REFERENCES tyosuoritus(id),
    FOREIGN KEY (tuntihintatyyppi_id) REFERENCES tuntihintatyyppi(id)
);

CREATE TABLE lasku (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    edellinen_lasku INT,
    tyosuoritus_id INT NOT NULL,
    summa NUMERIC(10, 2) NOT NULL,
    pvm DATE NOT NULL DEFAULT CURRENT_DATE,
    era_pvm DATE NOT NULL DEFAULT (CURRENT_DATE + 30),
    maksettu_pvm DATE,
    FOREIGN KEY (edellinen_lasku) REFERENCES lasku(id),
    FOREIGN KEY (tyosuoritus_id) REFERENCES tyosuoritus(id)
);

CREATE TABLE toimittaja (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nimi TEXT NOT NULL,
    osoite TEXT
);

CREATE TABLE varastotarvike (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    toimittaja_id INT NOT NULL,
    nimi TEXT NOT NULL,
    merkki TEXT NOT NULL,
    tyyppi TEXT NOT NULL, 
    varastotilanne INT NOT NULL,
    yksikko TEXT NOT NULL,
    hinta_sisaan NUMERIC(10, 2) NOT NULL,
    vanhentunut BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (toimittaja_id) REFERENCES toimittaja(id) 
);

CREATE TABLE tarvike (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tyosuoritus_id INT NOT NULL,
    varastotarvike_id INT NOT NULL,
    maara INT NOT NULL,
    hinta_ulos NUMERIC(10, 2) NOT NULL,
    pvm DATE NOT NULL DEFAULT CURRENT_DATE,
    aleprosentti percentage NOT NULL DEFAULT 0,
    alv_prosentti percentage NOT NULL,
    hinta NUMERIC(10, 2) GENERATED ALWAYS AS (maara * hinta_ulos * (1 - aleprosentti)) STORED,
    alv NUMERIC(10, 2) GENERATED ALWAYS AS (maara * hinta_ulos * (1 - aleprosentti) * alv_prosentti) STORED,
    FOREIGN KEY (tyosuoritus_id) REFERENCES tyosuoritus(id),
    FOREIGN KEY (varastotarvike_id) REFERENCES varastotarvike(id)
);


/*
----------------------
       FUNKTIOT
----------------------
*/

-- Laskun edellisten laskujen määrä eli tästä saadaan järjestysluku (+1) sekä laskutuslisä (5 euroa per edellinen)
CREATE OR REPLACE FUNCTION laske_edelliset_laskut(lasku_id INTEGER)
RETURNS INTEGER AS
$$
DECLARE
    edellisten_maara INTEGER := 0;
    nykyinen_id INTEGER := lasku_id;
BEGIN
    LOOP
        SELECT edellinen_lasku INTO nykyinen_id FROM lasku WHERE id = nykyinen_id;

        IF nykyinen_id IS NULL THEN
            EXIT;
        END IF;

        edellisten_maara := edellisten_maara + 1;
    END LOOP;

    RETURN edellisten_maara;
END;
$$
LANGUAGE plpgsql;

-- Laskee viivästyskoron laskulle
CREATE OR REPLACE FUNCTION laske_viivastyskorko(lasku_id INTEGER)
RETURNS NUMERIC(10, 2) AS
$$
DECLARE
    nykyinen_id INTEGER := lasku_id;
    seuraava_id INTEGER := NULL;
    taso INTEGER := 1;

    alkuperainen_summa NUMERIC(10, 2) := 0;
    alkuperainen_era_pvm DATE := NULL;
    lasku_pvm DATE := NULL;
BEGIN
    -- Loopataan laskujen läpi, kunnes löydetään ketjun loppu eli alkuperäinen lasku
    LOOP
        SELECT edellinen_lasku INTO seuraava_id FROM lasku WHERE id = nykyinen_id;

        IF seuraava_id IS NULL THEN
            -- Jos lasku ei ole 3. tai ylempi, ei tule viivästyskorkoa.
            IF taso < 3 THEN
                RETURN 0;
            END IF;
            EXIT;
        END IF;

        nykyinen_id := seuraava_id;
        taso := taso + 1;
    END LOOP;

    -- Talletetaan alkuperäisen laskun summa ja eräpäivämäärä
    SELECT summa, era_pvm INTO alkuperainen_summa, alkuperainen_era_pvm FROM lasku WHERE id = nykyinen_id;
    -- Laskun pvm
    SELECT pvm INTO lasku_pvm FROM lasku WHERE id = lasku_id;
    
    RETURN ROUND(alkuperainen_summa * 0.16 * (lasku_pvm - alkuperainen_era_pvm) / 365, 2);
END;
$$
LANGUAGE plpgsql;


/*
----------------------
       NÄKYMÄT
----------------------
*/

CREATE VIEW tuntihinta_nakyma AS 
    SELECT 
        tyosuoritus_id,
        tuntihintatyyppi_id,
        pvm,
        alv_prosentti,
        aleprosentti,
        tunnit,
        ROUND(tuntihinta * tunnit * (1 - aleprosentti), 2) AS hinta,
        ROUND(tuntihinta * tunnit * (1 - aleprosentti) * alv_prosentti, 2) AS alv
    FROM 
        tuntihinta
    JOIN tuntihintatyyppi
        ON tuntihintatyyppi.id = tuntihinta.tuntihintatyyppi_id;

-- Näkymä tuntityölle (kokoaa tuntihintatyypeistä hinnat ja alvit jokaiselle tuntihinnalle)
CREATE VIEW tuntihinnat AS
    SELECT 
        tyosuoritus_id,
        SUM(hinta) AS tuntihinta_hinta,
        SUM(alv) AS tuntihinta_alv,
        SUM(hinta + alv) AS kotitalousvahennys
    FROM
        tuntihinta_nakyma th
    JOIN tuntihintatyyppi tt
        ON tt.id = th.tuntihintatyyppi_id
    GROUP BY tyosuoritus_id;

-- Näkymä tyosuorituksen tarvikkeiden hinnoille (kokoaa tarvikkeiden hinnat ja alvit jokaiselle työsuoritukselle)
CREATE VIEW tarvikkeet AS
    SELECT 
        tyosuoritus_id,
        SUM(hinta) AS tarvike_hinta,
        SUM(alv) AS tarvike_alv,
        SUM(hinta + alv) AS tarvike_summa
    FROM
        tarvike
    GROUP BY tyosuoritus_id;

-- Iso näkymä, joka esittää laskuille hinnan, ja hinnan osuuksien erittelyn. 
CREATE VIEW koko_lasku AS
    /*
        Edellisille laskuille väliaikainen taulu, jotta funktioita ei
        tarvitse kutsua useaan otteeseen kyselyn SELECT-osiossa.
    */
    WITH
        edelliset_laskut_CTE AS (
            SELECT 
                id, 
                laske_edelliset_laskut(id) AS edelliset_laskut,
                laske_viivastyskorko(id) AS viivastyskorko
            FROM 
                lasku
        )
    SELECT 
        lasku.id AS lasku_id, 
        lasku.tyosuoritus_id AS tyosuoritus_id,
        lasku.summa AS summa,
        (lasku.summa + edelliset_laskut * 5 + viivastyskorko) AS yhteissumma,
        (edelliset_laskut + 1) AS jarjestysluku,
        (edelliset_laskut * 5) AS laskutuslisä,
        viivastyskorko,
        tarvikkeet.tarvike_hinta AS tarvike_hinta,
        tarvikkeet.tarvike_alv AS tarvike_alv,
        tuntihinnat.tuntihinta_hinta AS tyo_hinta,       
        tuntihinnat.tuntihinta_alv AS tyo_alv,
        CASE 
            WHEN urakka.lahtohinta IS NULL 
                THEN tuntihinnat.kotitalousvahennys
                ELSE urakka.kotitalousvahennys
            END
        AS kotitalousvahennys,
        CASE 
            WHEN urakka.lahtohinta IS NULL 
                THEN tuntihinnat.kotitalousvahennys + tarvike_summa
                ELSE urakka.kotitalousvahennys
            END
        AS kokonaissumma
    FROM
        lasku
    JOIN tyosuoritus 
        ON lasku.tyosuoritus_id = tyosuoritus.id
    JOIN tarvikkeet 
        ON tyosuoritus.id = tarvikkeet.tyosuoritus_id
    JOIN edelliset_laskut_CTE 
        ON lasku.id = edelliset_laskut_CTE.id
    LEFT JOIN urakka 
        ON tyosuoritus.urakka_id = urakka.id
    LEFT JOIN tuntihinnat 
        ON lasku.tyosuoritus_id = tuntihinnat.tyosuoritus_id;