SELECT
    l.id,
    l.edellinen_lasku,
    l.tyosuoritus_id,
    l.summa,
    TO_CHAR(l.pvm, 'DD.MM.YYYY') AS pvm,
    TO_CHAR(l.era_pvm, 'DD.MM.YYYY') as era_pvm,
    TO_CHAR(l.maksettu_pvm, 'DD.MM.YYYY') as maksettu_pvm,
    laske_edelliset_laskut(l.id) AS jarjestysluku,
    (laske_edelliset_laskut(l.id) = 1) AS is_muistutuslasku,
    (laske_edelliset_laskut(l.id) = 2) AS is_karhulasku,
    (laske_edelliset_laskut(l.id) - 1) AS karhuluku
FROM
    lasku l
WHERE
    l.tyosuoritus_id = $1
ORDER BY
    l.id;
