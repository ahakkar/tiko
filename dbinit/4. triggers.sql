-- Trigger funktio
CREATE OR REPLACE FUNCTION urakka_korotus_trigger_funktio()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS 
$$
BEGIN
    -- Jos työsuoritus ei ole urakka, ei tehdä mitään
    IF NEW.urakka_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Jos asiakkaalla on maksamattomia erääntyneitä laskuja, lisätään urakkaan 30% korotus
    -- HUOM! Tässä ei huomioida muistutuslaskun edellistä laskua, koska uusi lasku korvaa edellisen
    IF EXISTS (
        SELECT 
            lasku.id,
            lasku.edellinen_lasku,
            lasku.era_pvm,
            lasku.maksettu_pvm
        FROM lasku
        JOIN tyosuoritus ON lasku.tyosuoritus_id = tyosuoritus.id
        WHERE 
            tyosuoritus.asiakas_id = NEW.asiakas_id AND
            era_pvm < CURRENT_DATE AND
            maksettu_pvm IS NULL AND
            lasku.id NOT IN (
                SELECT DISTINCT
                    lasku.edellinen_lasku
                FROM 
                    lasku
                WHERE 
                    lasku.edellinen_lasku IS NOT NULL
            )
    ) THEN
        UPDATE urakka SET korotusprosentti = 0.3 WHERE id = NEW.urakka_id;
    -- Jos asiakkaalla on karhuttuja laskuja viimeisen kahden vuoden aikana, lisätään urakkaan 10% korotus
    ELSIF EXISTS (
            SELECT 
                lasku.id
            FROM 
                lasku 
            JOIN 
                tyosuoritus ON tyosuoritus.id = lasku.tyosuoritus_id
            WHERE 
                laske_edelliset_laskut(lasku.id) >= 2 AND
                tyosuoritus.asiakas_id = NEW.asiakas_id AND
                era_pvm > CURRENT_DATE - INTERVAL '2 years'
        ) THEN
            UPDATE urakka SET korotusprosentti = 0.1 WHERE id = NEW.urakka_id;
    END IF;
    RETURN NEW;
END
$$;

CREATE TRIGGER urakka_korotus 
    AFTER UPDATE OR INSERT
    ON tyosuoritus
    FOR EACH ROW
    EXECUTE FUNCTION urakka_korotus_trigger_funktio();

INSERT INTO urakka (lahtohinta, aleprosentti, alv_prosentti, korotusprosentti)
VALUES
(100.00, 0, 0.24, 0), -- Tähän (urakka 3) tulee korotusprosentti 10%
(100.00, 0, 0.24, 0); -- Tähän (urakka 4) tulee korotusprosentti 30%

INSERT INTO tyosuoritus (tyokohde_id, urakka_id, asiakas_id, aloitus_pvm, tila) VALUES
(4,    3, 2, '2024-02-14', 'Suunnitellaan'), -- Asiakkaalla 2 on karhuttu lasku viimeisen 2. vuoden aikana
(5,    4, 3, '2024-02-14', 'Suunnitellaan'); -- Asiakkaalla 3 on maksamattomia erääntyneitä laskuja