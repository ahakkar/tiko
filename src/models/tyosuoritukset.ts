import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './db';
import {Tyosuoritukset} from './int/tyosuoritukset.interface';
import {Tyosuoritus} from './int/tyosuoritus.interface';
import {Asiakas} from './int/asiakas.interface';
import {Tyokohde} from './int/tyokohde.interface';

/**
 *
 * @returns Työsuorituksen tiedot (työsuoritus, asiakas, työkohde)
 */
async function getTyosuoritukset(): Promise<Tyosuoritukset[]> {
  try {
    const queryStr = await getQueryFromFile('getTyosuoritukset.sql');
    console.log('jees');
    const {rows} = await query(queryStr);
    console.log(rows);
    return mapRowsToTyosuoritukset(rows);
  } catch (e) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
}

/**
 *
 * @param id tyosuorituksen id
 * @returns yhden tyosuorituksen tiedot
 */
async function getTyoSuoritusById(id: number): Promise<Tyosuoritus> {
  const result = await query<Tyosuoritus>(
    'SELECT * FROM tyosuoritus WHERE id = $1',
    [id]
  );

  const asiakas = result.rows.at(0);
  if (!asiakas) {
    throw new Error('Tyosuoritusta ei löytynyt.');
  }

  return asiakas;
}

/**
 * Muuntaa tietokannasta tulleet rivit Tyosuoritukset-interfaceksi
 * @param rows tietokannasta tulleet rivit
 * @returns Tyosuoritus-olioiden taulukko
 */
function mapRowsToTyosuoritukset(rows: QueryResultRow[]): Tyosuoritukset[] {
  const result: Tyosuoritukset[] = [];

  for (const row of rows) {
    const asiakas: Asiakas = {
      id: row['asiakas_id'],
      nimi: row['asiakas_nimi'],
      osoite: row['asiakas_osoite'],
      postinumero: row['asiakas_postinumero:'],
      postitoimipaikka: row['asiakas_postitoimipaikka'],
      sahkoposti: row['asiakas_sahkoposti'],
      puhelinnumero: row['asiakas_puhelinnumero'],
    };

    const tyosuoritus: Tyosuoritus = {
      id: row['tyosuoritus_id'],
      tyokohde_id: row['tyokohde_id'],
      urakka_id: row['urakka_id'],
      aloitus_pvm: row['aloitus_pvm'],
      asiakas_id: row['asiakas_id'],
      tila: row['tila'],
    };

    const tyokohde: Tyokohde = {
      id: row['tyokohde_id'],
      tyyppi: row['tyokohde_tyyppi'],
      osoite: row['tyokohde_osoite'],
      postinumero: row['tyokohde_postinumero'],
      postitoimipaikka: row['tyokohde_postitoimipaikka'],
    };

    result.push({
      tyosuoritus,
      asiakas,
      tyokohde,
    });
  }
  console.log(rows);
  return result;
}

export {getTyosuoritukset, getTyoSuoritusById};