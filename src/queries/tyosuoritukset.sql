SELECT
    t.id AS tyosuoritus_id,
    t.urakka_id,
    t.aloitus_pvm,
    t.tila,
    a.id AS asiakas_id,
    a.nimi AS asiakas_nimi,
    a.osoite AS asiakas_osoite,
    a.postinumero AS asiakas_postinumero,
    a.postitoimipaikka AS asiakas_postitoimipaikka,
    a.sahkoposti AS asiakas_sahkoposti,
    a.puhelinnumero AS asiakas_puhelinnumero,
    k.id AS tyokohde_id,
    k.tyyppi AS tyokohde_tyyppi,
    k.osoite AS tyokohde_osoite,
    k.postinumero AS tyokohde_postinumero,
    k.postitoimipaikka AS tyokohde_postitoimipaikka
FROM
    tyosuoritus t
JOIN asiakas a ON t.asiakas_id = a.id
JOIN tyokohde k ON t.tyokohde_id = k.id;