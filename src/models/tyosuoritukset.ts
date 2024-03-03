import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './db';
import {Tyosuoritukset} from './int/tyosuoritukset.interface';
import {Tyosuoritus} from './int/tyosuoritus.interface';
import {Asiakas} from './int/asiakas.interface';
import {Tyokohde} from './int/tyokohde.interface';
import {Urakka} from './int/urakka.interface';

/**
 * Hakee tietokannasta kaikki tyosuoritukset
 * @returns Työsuorituksen tiedot (työsuoritus, asiakas, työkohde)
 */
async function getTyosuoritukset(): Promise<Tyosuoritukset[]> {
  try {
    const queryStr = await getQueryFromFile('tyosuoritukset.sql');
    const {rows} = await query(queryStr);

    return mapRowsToTyosuoritukset(rows);
  } catch (e) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
}

/**
 * Hakee tietokannasta yhden tyosuorituksen tiedot id:n perusteella
 * @param id tyosuorituksen id
 * @returns yhden tyosuorituksen tiedot
 */
async function getTyoSuoritusById(id: number): Promise<Tyosuoritukset[]> {
  try {
    const queryStr = await getQueryFromFile('tyosuoritus.sql');
    const {rows} = await query(queryStr, [id]);

    if (rows === undefined || rows.length === 0) {
      throw new Error('Tyosuorituksia ei löytynyt.');
    }

    const tyosuorituksetArray = mapRowsToTyosuoritukset(rows);

    if (tyosuorituksetArray[0] === undefined) {
      throw new Error('Tyosuorituksia ei löytynyt.');
    }
    return tyosuorituksetArray;
  } catch (e) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
}

/**
 * Hakee tietokannasta kyselyn määrittelemät tiedot id:n perusteella
 * @param id tyosuorituksen id
 * @param queryFile kyselytiedoston nimi
 * @returns tietokannasta haetut rivit
 */
async function getDataById<T extends QueryResultRow>(
  id: number,
  queryFile: string
): Promise<T[]> {
  try {
    const queryStr = await getQueryFromFile(queryFile);
    const {rows} = await query<T>(queryStr, [id]);
    return rows;
  } catch (e) {
    throw new Error(
      `Virhe haettasessa työsuorituksen tietoja id:llä: ${id}\nkysely: ${queryFile}\nvirheilmoitus: ${e}`
    );
  }
}

/**
 * Muuntaa tietokannasta tulleet rivit Tyosuoritukset-interfaceksi
 * TODO korvaa utils/parse.ts tyylin funktiolla
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
      postinumero: row['asiakas_postinumero'],
      postitoimipaikka: row['asiakas_postitoimipaikka'],
      sahkoposti: row['asiakas_sahkoposti'],
      puhelinnumero: row['asiakas_puhelinnumero'],
    };

    const tyosuoritus: Tyosuoritus = {
      id: row['tyosuoritus_id'],
      tyokohde_id: row['tyokohde_id'],
      urakka_id: row['urakka_id'],
      aloitus_pvm: row['tyosuoritus_aloituspvm'],
      asiakas_id: row['tyosuoritus_asiakasid'],
      tila: row['tyosuoritus_tila'],
    };

    const tyokohde: Tyokohde = {
      id: row['tyokohde_id'],
      tyyppi: row['tyokohde_tyyppi'],
      osoite: row['tyokohde_osoite'],
      postinumero: row['tyokohde_postinumero'],
      postitoimipaikka: row['tyokohde_postitoimipaikka'],
    };

    const urakka: Urakka = {
      id: row['urakka_id'],
      lahtohinta: row['urakka_lahtohinta'],
      aleprosentti: row['urakka_aleprosentti'],
      alv_prosentti: row['urakka_alvprosentti'],
      korotusprosentti: row['urakka_korotusprosentti'],
      hinta: row['urakka_hinta'],
      hinta_yhteensa: row['urakka_hintayhteensa'],
      alv: row['urakka_alv'],
      kotitalousvahennys: row['urakka_kotitalousvahennys'],
    };

    result.push({
      tyosuoritus,
      asiakas,
      tyokohde,
      urakka,
    });
  }
  return result;
}

export {getTyosuoritukset, getTyoSuoritusById, getDataById};
