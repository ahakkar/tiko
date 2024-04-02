SELECT 
    ROUND(SUM(hinta_yhteensa), 2) AS lahtohinta,
    ROUND(SUM(alehinta_yhteensa), 2) AS alehinta,
    ROUND(SUM(alv_hinta_yhteensa), 2) AS alv_hinta
FROM (
    SELECT
        tht.tuntihinta * th.tunnit AS hinta_yhteensa,
        tht.tuntihinta * th.tunnit * (1-th.aleprosentti) AS alehinta_yhteensa,
        tht.tuntihinta * th.tunnit * (1-th.aleprosentti) * (1 + th.alv_prosentti) AS alv_hinta_yhteensa
    FROM
        tuntihinta th
    JOIN tuntihintatyyppi tht ON th.tuntihintatyyppi_id = tht.id
    WHERE
        th.tyosuoritus_id = $1

    UNION ALL

    SELECT
        t.hinta_ulos * t.maara AS hinta_yhteensa,
        t.hinta_ulos * t.maara * (1-t.aleprosentti) AS alehinta_yhteensa,
        t.hinta_ulos * t.maara * (1-t.aleprosentti) * (1 + t.alv_prosentti) AS alv_hinta_yhteensa
    FROM
        tarvike t
    WHERE
        t.tyosuoritus_id = $1
);
