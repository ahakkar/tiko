SELECT
    l.id,
    l.edellinen_lasku,
    l.tyosuoritus_id,
    l.summa,
    TO_CHAR(l.pvm, 'DD.MM.YYYY') AS pvm,
    TO_CHAR(l.era_pvm, 'DD.MM.YYYY') as era_pvm,
    TO_CHAR(l.maksettu_pvm, 'DD.MM.YYYY') as maksettu_pvm,
    laske_edelliset_laskut(l.id) AS jarjestysluku
FROM
    lasku l
WHERE
    l.tyosuoritus_id = $1
ORDER BY
    l.id;
