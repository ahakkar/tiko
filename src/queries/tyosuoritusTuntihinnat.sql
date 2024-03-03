SELECT
    th.id AS tuntihinta_id,
    th.tyosuoritus_id,
    th.tuntihintatyyppi_id,
    th.pvm,
    th.alv_prosentti,
    th.aleprosentti,
    th.tunnit,
    tht.tyyppi,
    tht.tuntihinta,
    ROUND(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti), 2) AS hinta,
    ROUND(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti) * th.alv_prosentti, 2) AS alv,
    ROUND(tht.tuntihinta * th.tunnit * (1 - th.aleprosentti) + tht.tuntihinta * th.tunnit * (1 - th.aleprosentti) * th.alv_prosentti, 2) AS hinta_yhteensa
FROM
    tuntihinta th
JOIN tuntihintatyyppi tht ON th.tuntihintatyyppi_id = tht.id
WHERE
    th.tyosuoritus_id = $1;
