CREATE TABLE kayttajat (
    nimi TEXT NOT NULL PRIMARY KEY,
    salasanatiiviste TEXT NOT NULL,
    rooli TEXT NOT NULL
);

INSERT INTO kayttajat (nimi, salasanatiiviste, rooli)
VALUES
-- Vaikka salasanat ovat molemmilla "salasana", salasanatiivisteet näyttävät
-- erilaisilta, mikä on tietoturvan kannalta erinomaista.
('admin', '$2b$10$6AxDO9gw5L.j2RCuC01ODega3at3S0Z7ksHyA7eiHOk0uQBI/Hy2q', 'write'),
('työntekijä', '$2b$10$5evxfBmq3gmDZg.r/TrHmOd6Aza9C4ewMdaWbuhEu/CnO7mEk3Xta', 'read');
