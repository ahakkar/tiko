SELECT
    t.id,
    t.tyosuoritus_id,
    t.varastotarvike_id,
    t.maara,
    t.hinta_ulos,
    t.pvm,
    t.aleprosentti,
    t.alv_prosentti,
    t.hinta,
    t.alv,
    v.nimi,
    v.hinta_sisaan,
    ROUND(t.hinta_ulos * t.maara * (1 - aleprosentti) + t.alv, 2) AS hinta_yhteensa 
FROM
    tarvike t
JOIN varastotarvike v ON t.varastotarvike_id = v.id
WHERE
    t.tyosuoritus_id = $1;