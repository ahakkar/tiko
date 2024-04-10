SELECT 
    ROUND(SUM(hinta_yhteensa), 2) AS lahtohinta,
    ROUND(SUM(alehinta_yhteensa), 2) AS alehinta,
    ROUND(SUM(alv_hinta_yhteensa), 2) AS alv_hinta
FROM (
    SELECT
        tht.tuntihinta * th.tunnit AS hinta_yhteensa,
        (tht.tuntihinta * th.tunnit * (1-th.aleprosentti)) * (1-u.aleprosentti) * (1+u.korotusprosentti) AS alehinta_yhteensa,
        tht.tuntihinta * th.tunnit * (1-th.aleprosentti) * (1-u.aleprosentti) * (1+u.korotusprosentti) * (1 + th.alv_prosentti) AS alv_hinta_yhteensa
    FROM
        tuntihinta th
    JOIN tuntihintatyyppi tht ON th.tuntihintatyyppi_id = tht.id
    JOIN tyosuoritus t ON t.id = th.tyosuoritus_id
    JOIN urakka u ON u.id = t.urakka_id
    WHERE
        th.tyosuoritus_id = $1

    UNION ALL

    SELECT
        t.hinta_ulos * t.maara AS hinta_yhteensa,
        t.hinta_ulos * t.maara * (1-t.aleprosentti) * (1-u.aleprosentti) * (1+u.korotusprosentti) AS alehinta_yhteensa,
        t.hinta_ulos * t.maara * (1-t.aleprosentti) * (1-u.aleprosentti) * (1+u.korotusprosentti) * (1 + t.alv_prosentti) AS alv_hinta_yhteensa
    FROM
        tarvike t
    JOIN tyosuoritus ts ON ts.id = t.tyosuoritus_id
    JOIN urakka u ON u.id = ts.urakka_id
    WHERE
        t.tyosuoritus_id = $1
) AS laskeUrakkaSummat;
