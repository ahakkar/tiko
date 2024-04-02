SELECT
    ROUND(SUM(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti)), 2) AS alv0_summa,
    ROUND(SUM(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti) * (1 + th.alv_prosentti)), 2) AS summa,    
    ROUND(SUM(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti) * th.alv_prosentti), 2) AS alv
FROM
    tuntihinta th
JOIN tuntihintatyyppi tht ON th.tuntihintatyyppi_id = tht.id
WHERE
    th.tyosuoritus_id = $1;