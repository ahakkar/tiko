SELECT 
    l.id,
    ts.id AS tyosuoritus_id,
    a.nimi AS asiakas_nimi,
    tk.osoite AS tyokohde_osoite,
    tk.postitoimipaikka AS tyokohde_postitoimipaikka,
    l.pvm,
    l.era_pvm,
    l.summa,
    CASE WHEN l.maksettu_pvm IS NULL THEN false ELSE true END AS is_maksettu 
FROM lasku l
JOIN tyosuoritus ts ON ts.id = l.tyosuoritus_id
JOIN asiakas a ON a.id = ts.asiakas_id
JOIN tyokohde tk ON tk.id = ts.tyokohde_id;

