SELECT
    alv_prosentti,
    SUM(alv_summa) AS total_vat
FROM
    (SELECT * FROM tarvike_alv_yhteenveto WHERE tyosuoritus_id = $1
     UNION ALL
     SELECT * FROM tuntihinta_alv_yhteenveto WHERE tyosuoritus_id = $1) AS combined_vat_summary
GROUP BY
    alv_prosentti;
