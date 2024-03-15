SELECT
    l.id,
    l.edellinen_lasku,
    l.tyosuoritus_id,
    l.summa,
    l.pvm AS pvm,
    l.era_pvm AS era_pvm,
    l.maksettu_pvm AS maksettu_pvm,
    laske_edelliset_laskut(l.id) AS jarjestysluku,
    (laske_edelliset_laskut(l.id) = 1) AS is_muistutuslasku,
    (laske_edelliset_laskut(l.id) = 2) AS is_karhulasku,
    (laske_edelliset_laskut(l.id) - 1) AS karhuluku
FROM
    lasku l
WHERE
    l.id = $1
ORDER BY
    l.id;
