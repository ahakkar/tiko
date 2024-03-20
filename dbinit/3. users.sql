CREATE TABLE kayttajat (
    nimi TEXT NOT NULL PRIMARY KEY,
    salasanatiiviste TEXT NOT NULL,
    rooli TEXT NOT NULL
);

INSERT INTO kayttajat (nimi, salasanatiiviste, rooli)
VALUES
('admin', '$2b$10$6AxDO9gw5L.j2RCuC01ODega3at3S0Z7ksHyA7eiHOk0uQBI/Hy2q', 'write'),
('työntekijä', '$2b$10$6AxDO9gw5L.j2RCuC01ODega3at3S0Z7ksHyA7eiHOk0uQBI/Hy2q', 'read');
