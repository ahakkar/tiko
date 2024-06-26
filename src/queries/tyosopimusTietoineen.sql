SELECT
    t.id AS tyosuoritus_id,
    t.urakka_id,
    t.aloitus_pvm AS tyosuoritus_aloitus_pvm,
    t.tila AS tyosuoritus_tila,
    a.id AS tyosuoritus_asiakas_id,
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
    k.postitoimipaikka AS tyokohde_postitoimipaikka,
    u.lahtohinta AS urakka_lahtohinta,
    u.aleprosentti AS urakka_aleprosentti,
    u.alv_prosentti as urakka_alvprosentti,
    u.korotusprosentti AS urakka_korotusprosentti,
    u.hinta AS urakka_hinta,
    ROUND(u.hinta * (1 + u.alv_prosentti) * 1 - u.aleprosentti, 2) AS urakka_hintayhteensa,
    u.alv AS urakka_alv,
    u.kotitalousvahennys AS urakka_kotitalousvahennys
FROM
    tyosuoritus t
JOIN asiakas a ON t.asiakas_id = a.id
JOIN tyokohde k ON t.tyokohde_id = k.id
LEFT JOIN urakka u ON t.urakka_id = u.id
WHERE
    t.id = $1;
