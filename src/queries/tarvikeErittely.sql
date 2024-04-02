SELECT
    ROUND(SUM(t.hinta_ulos * t.maara * (1 - t.aleprosentti)), 2) AS alv0_summa,
    ROUND(SUM(t.hinta_ulos * t.maara * (1 - t.aleprosentti) * (1 + t.alv_prosentti)), 2) AS summa,    
    ROUND(SUM(t.hinta_ulos * t.maara * (1 - t.aleprosentti) * t.alv_prosentti), 2) AS alv
FROM
    tarvike t
WHERE
    t.tyosuoritus_id = $1;