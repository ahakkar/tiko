SELECT 
    ROUND(SUM(hinta_yhteensa), 2) AS lahtohinta
FROM (
    SELECT
        tht.tuntihinta * th.tunnit AS hinta_yhteensa
    FROM
        tuntihinta th
    JOIN tuntihintatyyppi tht ON th.tuntihintatyyppi_id = tht.id
    WHERE
        th.tyosuoritus_id = $1

    UNION ALL

    SELECT
        t.hinta_ulos * t.maara AS hinta_yhteensa
    FROM
        tarvike t
    JOIN varastotarvike v ON t.varastotarvike_id = v.id
    WHERE
        t.tyosuoritus_id = $1
);
