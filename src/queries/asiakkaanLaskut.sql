SELECT  * 
FROM asiakas a 
JOIN tyosuoritus t ON t.asiakas_id = a.id
JOIN koko_lasku ON koko_lasku.tyosuoritus_id = t.id
WHERE a.id = $1;