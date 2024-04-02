SELECT
    alv_prosentti,
    SUM(hinta_summa) AS hinta_summa,
    SUM(alv_summa) AS alv_summa
FROM
    (SELECT * FROM tarvike_alv_yhteenveto WHERE tyosuoritus_id = $1
     UNION ALL
     SELECT * FROM tuntihinta_alv_yhteenveto WHERE tyosuoritus_id = $1) AS yhdistetty_alv_erittely
GROUP BY
    alv_prosentti;
