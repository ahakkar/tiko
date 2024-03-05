SELECT
    v.nimi AS tarvike_nimi,
    maara AS tarvike_maara,
    yksikko AS tarvike_yksikko,
    t.pvm AS tarvike_pvm,
    a.nimi AS asiakas_nimi,
    a.puhelinnumero AS asiakas_puhelinnumero,
    a.sahkoposti AS asiakas_sahkoposti,
    k.tyyppi AS kohde_tyyppi,
    k.osoite AS kohde_osoite,
    k.postinumero AS kohde_postinumero,
    k.postitoimipaikka AS kohde_postitoimipaikka
FROM
    varastotarvike v
JOIN
    tarvike t ON v.id = t.varastotarvike_id
JOIN
    tyosuoritus ts ON t.tyosuoritus_id = ts.id
JOIN
    asiakas a ON ts.asiakas_id = a.id
JOIN
    tyokohde k ON ts.tyokohde_id = k.id
WHERE
    v.toimittaja_id = $1    
