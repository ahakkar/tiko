import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './dbModel';
import {
  Asiakas,
  Tyokohde,
  Urakka,
  Tyosopimus,
  KokoTyosopimus,
} from './interfaces';
import {CONTRACT_STATES} from '../constants';

/**
 * Hakee tietokannasta työsuorituksien perustiedot
 * @returns tyosuorituksien tiedot
 */
export const haeTyosopimukset = async (): Promise<KokoTyosopimus[]> => {
  const queryStr = await getQueryFromFile('kaikkiTyosopimukset.sql');
  const {rows} = await query(queryStr);

  if (rows.length === 0) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  return rows.map(row => mapRowToKokoTyosopimus(row));
};

/**
 * Tarkistaa onko työsuorituksen tiedot validit
 * @param a Tyosuoritus
 * @returns true jos tiedot ovat validit
 */
const validoiTyosopimus = (t: Tyosopimus): Boolean => {
  // TODO hienompi työkohteen tietojen validointi
  if (Number.isNaN(t['tyokohde_id']) || Number.isNaN(t['asiakas_id'])) {
    return false;
  }

  return true;
};

/**
 * Lisää uuden työsuorituksen tietokantaan
 * @param ts Tyosuoritus
 * @returns luodun työsuorituksen tiedot
 */
const lisaaTyosopimus = async (ts: Tyosopimus): Promise<Tyosopimus> => {
  const result = await query<Tyosopimus>(
    'INSERT INTO tyosuoritus (tyokohde_id, urakka_id, asiakas_id, tila) VALUES ($1, $2, $3, $4) RETURNING *',
    [ts['tyokohde_id'], ts['urakka_id'], ts['asiakas_id'], ts['tila']]
  );

  if (!result.rows[0]) {
    throw new Error('Työsuoritusta ei voitu luoda.');
  }

  return result.rows[0];
};

/**
 * Lisää uuden urakan tietokantaan
 * @returns luodun urakan tiedot
 */
const luoUrakka = async (): Promise<Urakka> => {
  const result = await query<Urakka>(
    'INSERT INTO urakka (lahtohinta, aleprosentti, alv_prosentti, korotusprosentti) VALUES ($1, $2, $3, $4) RETURNING *',
    [0, 0, 0, 0]
  );

  if (!result.rows[0]) {
    throw new Error('Urakkaa ei voitu luoda.');
  }

  return result.rows[0];
};

export const haeKokoTyosopimus = async (
  id: number
): Promise<KokoTyosopimus> => {
  const queryStr = await getQueryFromFile('tyosopimusTietoineen.sql');
  const {rows} = await query(queryStr, [id]);

  if (rows[0] === undefined || rows.length === 0) {
    throw new Error('Työsopimusta ei löytynyt.');
  }

  return mapRowToKokoTyosopimus(rows[0]);
};

/**
 * Muuntaa tietokannasta tulleet rivit Tyosuoritukset-interfaceksi
 * TODO korvaa utils/parse.ts tyylin funktiolla
 * @param rows tietokannasta tulleet rivit
 * @returns Tyosuoritus-olioiden taulukko
 */
function mapRowToKokoTyosopimus(row: QueryResultRow): KokoTyosopimus {
  const asiakas: Asiakas = {
    id: row['asiakas_id'],
    nimi: row['asiakas_nimi'],
    osoite: row['asiakas_osoite'],
    postinumero: row['asiakas_postinumero'],
    postitoimipaikka: row['asiakas_postitoimipaikka'],
    sahkoposti: row['asiakas_sahkoposti'],
    puhelinnumero: row['asiakas_puhelinnumero'],
  };

  const tyosopimus: Tyosopimus = {
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

  const result: KokoTyosopimus = {asiakas, tyokohde, tyosopimus, urakka};

  return result;
}

export const updateTyosopimusState = async (id: number, state: string) => {
  if (!CONTRACT_STATES.includes(state)) {
    throw new Error('Invalid contract state.');
  }
  await query<Tyosopimus>('UPDATE tyosuoritus SET tila = $1 WHERE id = $2', [
    state,
    id,
  ]);
};

export {validoiTyosopimus, lisaaTyosopimus, luoUrakka};
