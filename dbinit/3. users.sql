CREATE TABLE kayttajat (
    nimi TEXT NOT NULL PRIMARY KEY,
    salasanatiiviste TEXT NOT NULL
);

INSERT INTO kayttajat (nimi, salasanatiiviste) VALUES ('admin', '$2b$10$Z1BhTGMoRifrnUvGRE9jkeUVXBWybirgQIboESzt7HMx5Np349sqq');
