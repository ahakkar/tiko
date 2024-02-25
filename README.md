# TIKO ryhmä 1

## Teknologia

## Ajaminen

## Kehittäminen

Kehityksen aikana käytämme Dockeria. Olemme luoneet kaksi konttia, joista yksi
sisältää tietokannamme PostgreSQL:n ja toinen palvelimemme Node.js:n.

PostgreSQL:n kontti käyttää alustamiseen [dbinit](./dbinit)-kansion
SQL-tiedostoja. SQL-tiedostot suoritetaan aakkosjärjestyksessä.

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

Kontit pysäytetään CTRL+C -näppäinyhdistelmällä.

Kontit voi poistaa komennolla:

```bash
docker compose down
```
