SELECT  * 
FROM asiakas a 
JOIN tyosuoritus t ON t.asiakas_id = a.id
WHERE a.id = $1;