# TIKO ryhmä 1

## Teknologia

## Ajaminen

## Kehittäminen

Kehityksen aikana käytämme Dockeria. Olemme luoneet kaksi konttia, joista yksi
sisältää tietokannamme PostgreSQL:n ja toinen palvelimemme Node.js:n.

PostgreSQL:n kontti käyttää alustamiseen [script](./script)-kansion
SQL-tiedostoja. Kontti siis luo tietokannan ja luo taulut tiedostojen
mukaisesti.

Node.js:n kontti käyttää projektikansiota suoraan sellaisenaan, joten ensin
pitää asentaa riippuvuudet:

```bash
npm install
```

Kontit käynnistetään komennolla:

```bash
docker compose up
```
