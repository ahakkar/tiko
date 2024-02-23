# TIKO ryhmä 1

## Teknologia

## Ajaminen

## Kehittäminen

Kehityksen aikana käytämme Dockeria. Olemme luoneet kaksi konttia, joista yksi
sisältää tietokannamme PostgreSQL:n ja toinen palvelimemme Node.js:n.

PostgreSQL:n kontti käyttää alustamiseen [script](./script)-kansion
SQL-tiedostoja. Kontti siis luo tietokannan ja luo taulut tiedostojen
mukaisesti.

Kontit käynnistetään komennolla:

```bash
docker compose up
```

Edellinen komento myös lataa tarvittavat Node.js:n paketit kontin sisäiseen
node_modules-kansioon, kun komentoa suoritetaan ensimmäistä kertaa.
Kun Node.js:n paketteja muutetaan, kontin sisäinen node_modules-kansio on
päivitettävä. Tämä onnistuu `--build app`-lipulla:

```bash
docker compose up --build app
```
