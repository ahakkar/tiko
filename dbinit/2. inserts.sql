INSERT INTO toimittaja
(nimi, osoite)
VALUES
('How-data', 'Hervannankatu 3 22950 Ypäjä'),
('Junk Co', 'Hämeentie 24 33100 Tampere'),
('Moponet', 'Pereentie 6 33960 Pirkkala'),
('Tärsky Pub', 'Kullervontie 24 33500 Tampere');

INSERT INTO varastotarvike
(toimittaja_id, nimi, merkki, tyyppi, varastotilanne, yksikko, hinta_sisaan)
VALUES
(1, 'USB-Kaapeli', 'Xiangling Shenzhen Specialty Co.', 'johto', 40, 'kpl', 4.00),       --1
(1, 'Ethernet CAT6 suojattu', 'ASDF', 'johto', 1000, 'm', 0.50),
(1, 'HDMI 10m', 'Xianling Shenzhen Specialty Co.', 'johto', 30, 'kpl', 1.00),
(2, 'sahkokeskus', 'Elite', 'Sähkökeskukset ja ryhmäkeskukset', 10, 'kpl', 300.00),
(2, 'Palohälytin', 'Xiangling Shenzhen Specialty Co.', 'palohälytin', 100, 'kpl', 4.00), -- 5
(2, 'Munakello', 'Valuable Goods Mfg Co.', 'hälyttimet ja ajastimet', 100, 'kpl', 4.50),
(3, 'Sähköjohto', 'Creo', 'sähköjohto', 1000, 'm', 1.00),
(3, 'Jakorasia', 'BBA', 'Kojerasiat ja jakorasiat', 100, 'kpl', 3.00),
(3, 'Pistorasia', 'BBA', 'pistorasia', 100, 'kpl', 10.00),
(3, 'Maakaapeli', 'Tampereen kaapelitehdas Oy', 'Asennuskaapelit ja sähköjohdot', 1000, 'm', 4.00), -- 10
(3, '3-napainen vipuliitin 0,2-4 mm²', 'Awog', 'Johtoliittimet', 100, 'kpl', 0.80),
(3, 'Ryhmäkeskus VO5356.245P 25A PC IP65', 'Viola', 'Sähkökeskukset ja ryhmäkeskukset', 100, 'kpl', 210.00),
(4, 'Tuote A 4,5% 0,33L', 'Laatupanimo', 'virvoitusjuoma', 100, 'kpl', 1.00),
(4, 'Tuote B 4,6% 0,33L', 'Laatupanimo', 'virvoitusjuoma', 100, 'kpl', 1.00),
(4, 'opaskirja', 'OSYW', 'kirjallisuus', 100, 'kpl', 8.00); -- 15

INSERT INTO asiakas (nimi, osoite, postinumero, postitoimipaikka, sahkoposti, puhelinnumero)
VALUES
('Jaska Hosunen', 'Susimetsä 3', '33100', 'Tampere', 'jaska@rane.fi', '52353290'),
('Lissu Jokinen', 'Kukkakuja 2', '33100', 'Tampere', 'lissu.jokinen@luukku.com', '23956690'),
('Masa Näsänen', 'Masalantie 53 A 3', '33500', 'Helsinki', 'masa@gmail.com', '045325687');

INSERT INTO tyokohde (tyyppi, osoite, postinumero, postitoimipaikka)
VALUES
('Omakotitalo', 'Susimetsä', '33100', 'Tampere'),
('Kerrostalo', 'Herwannan Waltatie 254 D 3', '33700', 'Tampere'),
('Rivitalo', 'Puotonkorpi', '33500', 'Helsinki'),
('Rivitalo', 'Huitsinneva', '99500', 'Kilpisjärvi'),
('Kerrostalo', 'Masalantie', '22530', 'Ensiö'),
('Omakotitalo', 'Nurmitie', '33100', 'Tampere');

INSERT INTO tuntihintatyyppi (tyyppi, tuntihinta)
VALUES
('suunnittelu', 44.35),    -- 1
('työ', 36.29),            -- 2
('apu työ', 28.24);        -- 3

-- Esimerkkidatan täydennystä
INSERT INTO tuntihintatyyppi (tyyppi, tuntihinta)
VALUES
('urakkatyö', 50);  
INSERT INTO tuntihinta (tyosuoritus_id, tuntihintatyyppi_id, pvm, alv_prosentti, aleprosentti, tunnit)
VALUES
(1, 4, '2023-09-03', 0.24, 0, 2),
(4, 4, '2023-09-04', 0.24, 0, 1);    

INSERT INTO urakka (lahtohinta, aleprosentti, alv_prosentti, korotusprosentti)
VALUES
(100.00, 0, 0.24, 0),
(50.00, 0, 0.24, 0);

INSERT INTO tyosuoritus (tyokohde_id, urakka_id, asiakas_id, aloitus_pvm, tila)
VALUES
(1,    1, 1, '2023-09-05', 'Valmis'), -- susimetsä      - 1
(6, NULL, 2, '2024-01-15', 'Valmis'), -- nurmitie       - 2
(3, NULL, 3, '2024-01-16', 'Valmis'), -- puotonkorpi    - 3
(4,    2, 2, '2024-02-17', 'Valmis'), -- huitsinneva    - 4
(5, NULL, 3, '2024-02-14', 'Valmis'); -- masalantie     - 5

INSERT INTO tuntihinta (tyosuoritus_id, tuntihintatyyppi_id, pvm, alv_prosentti, aleprosentti, tunnit)
VALUES
(2, 1, '2023-09-03', 0.24, 0.1, 3),
(2, 2, '2023-09-04', 0.24, 0, 8),
(2, 2, '2023-09-05', 0.24, 0, 4), --
(3, 1, '2024-01-12', 0.24, 0.2, 8),
(3, 1, '2024-01-13', 0.24, 0.2, 8),
(3, 1, '2024-01-14', 0.24, 0.2, 9),
(3, 2, '2024-01-15', 0.24, 0.1, 7),
(3, 3, '2024-01-16', 0.24, 0, 3), --
(5, 1, '2024-02-11', 0.24, 0, 3),
(5, 2, '2024-02-12', 0.24, 0, 8),
(5, 2, '2024-02-13', 0.24, 0, 4);

INSERT INTO tarvike (tyosuoritus_id, varastotarvike_id, maara, hinta_ulos, pvm, aleprosentti, alv_prosentti)
VALUES
(1, 1, 1, 5,    '2023-09-05', 0, 0.24),
(2, 7, 3, 1.25, '2024-01-15', 0.1, 0.24),
(2, 15, 1, 10,  '2024-01-15', 0, 0.1),
(2, 9, 1, 12.5, '2024-01-15', 0.2, 0.24),
(3, 10, 100, 5, '2024-01-14', 0.1, 0.24),
(3, 4, 1, 375,  '2024-01-15', 0.05, 0.24),
(4, 5, 2, 5,    '2024-02-17', 0, 0.24),
(5, 7, 3, 1.25, '2024-02-14', 0.0, 0.24),
(5, 9, 1, 12.5, '2024-02-14', 0.0, 0.24);

INSERT INTO lasku (edellinen_lasku, tyosuoritus_id, summa, pvm, era_pvm, maksettu_pvm)
VALUES
(NULL, 1, 130.20,  '2023-10-01', '2023-10-15', NULL), -- 1
(1,    1, 135.20,  '2023-10-25', '2023-11-10', NULL),
(2,    1, 142.65,  '2023-11-27', '2023-12-13', '2023-12-01'),
(NULL, 2, 716.06,  '2024-02-01', '2024-02-15', '2024-02-15'), -- lissu / nurmitie
(NULL, 3, 2488.18, '2024-02-01', '2024-02-15', NULL), -- 5
(5,    3, 2493.18, '2024-02-15', '2024-03-01', NULL),
(6,    3, 2517.81, '2024-03-05', '2024-03-20', NULL),
(NULL, 4, 74.40,   '2024-03-01', '2024-03-15', NULL),
(NULL, 5, 725.13,  '2024-03-01', '2024-03-15', NULL);