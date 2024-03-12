SELECT 
    varastotarvike.*,
    toimittaja.nimi AS toimittaja_nimi
FROM varastotarvike
JOIN toimittaja
    ON varastotarvike.toimittaja_id = toimittaja.id
WHERE vanhentunut = FALSE;