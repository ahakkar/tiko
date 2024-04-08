SELECT 
    l.id,
    l.tyosuoritus_id,
    a.nimi AS asiakas_nimi,
    tk.osoite AS tyokohde_osoite,
    tk.postitoimipaikka AS tyokohde_postitoimipaikka,
    l.pvm,
    l.era_pvm,
    l.yhteissumma,
    CASE WHEN l.maksettu_pvm IS NULL THEN false ELSE true END AS is_maksettu 
FROM koko_lasku l
JOIN tyosuoritus ts ON ts.id = l.tyosuoritus_id
JOIN asiakas a ON a.id = ts.asiakas_id
JOIN tyokohde tk ON tk.id = ts.tyokohde_id
ORDER BY l.id;

