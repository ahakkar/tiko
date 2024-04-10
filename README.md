# TIKO ryhmä 1

## Teknologia

TypeScript + Node.js, Tailwind CSS, HTMX, PostgeSQL

## Ajaminen manuaalisesti

Luo tietokanta ja aja 1. tables.sql sinne.
Luo .env ja säädä asetukset .env.example mukaisesti 
npm install
npm run dev

## Projektin työnjako

Enemmistöpäätökset. Kaikki tekivät vähän kaikkea, erityisesti:

Antti Hakkarainen - modeleita, controllereita, tietokantakyselyitä, alv-näkymiä, tyylit
Kilian Kugge - tietokannan luontilauseet, tietokantafunktiot, näkymät, tarvikkeet, xml-datan parsiminen
Antti Pham - runko, login, middlewaret, controlleita, modaalit

## Kehittäminen

Kehityksen aikana käytämme Dockeria. Olemme luoneet kaksi konttia, joista yksi
sisältää tietokannamme PostgreSQL:n ja toinen palvelimemme Node.js:n.

PostgreSQL:n kontti käyttää alustamiseen [dbinit](./dbinit)-kansion
SQL-tiedostoja. SQL-tiedostot suoritetaan aakkosjärjestyksessä.

### Konttien käynnistäminen

Kontit käynnistetään komennolla:

```bash
docker compose up
```

Edellinen komento myös lataa tarvittavat Node.js:n paketit kontin sisäiseen
node_modules-kansioon, kun komentoa suoritetaan ensimmäistä kertaa.
Kun Node.js:n paketteja muutetaan, kontin sisäinen node_modules-kansio on
päivitettävä. Tämä onnistuu ajamalla `npm i` -komento kontin sisällä:

```bash
docker exec -it tiko_nodejs npm i
```

Kontit pysäytetään CTRL+C -näppäinyhdistelmällä.

Kontit voi poistaa komennolla:

```bash
docker compose down
```

### Tietokannan hallinta

Tietokanta sijaitsee Dockerissa, joten komento täytyy ajaa Dockerin kautta:

```bash
docker exec -it tiko_postgres psql -U tiko
```

## Kuvia

### Työsopimusnäkymä
![Sopimusnäkymä](/doc/kuva01.png?raw=true "Työsopimusnäkymä")

### Tarvikenäkymä
![Tarvikenäkymä](/doc/kuva02.png?raw=true "Tarvikenäkymä")

### Asiakasnäkymä
![Asiakasnäkymä](/doc/kuva03.png?raw=true "Asiakasnäkymä")

### Kaikki laskut
![Kaikki laskut](/doc/kuva04.png?raw=true "Kaikki laskut")

### Yksi lasku
![Laskunäkymä](/doc/kuva06.png?raw=true "Yksi lasku")

### Light mode
![Light mode](/doc/kuva05.png?raw=true "Light mode")