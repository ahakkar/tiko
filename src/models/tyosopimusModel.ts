import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './dbModel';
import {
  Asiakas,
  Tyokohde,
  Urakka,
  Tyosopimus,
  KokoTyosopimus,
} from './interfaces';
import {ContractState} from '../constants';
import {FlatObject, flatToNestedObject} from '../utils/parse';

/**
 * Hakee tietokannasta työsopimusten perustiedot
 * @returns lista työsopimuksista
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
 * Hakee tietokannasta yhden työsopimuksen tiedot
 * @param id työsopimuksen id
 * @returns yhden työsopimuksen tiedot
 */
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

/**
 * Muuntaa tietokannasta tulleen rivin KokoTyosopimus-interfaceksi
 * @param rows
 * @returns
 */
const mapRowToKokoTyosopimus = (row: QueryResultRow): KokoTyosopimus => {
  const nestedRow = flatToNestedObject(row as FlatObject);

  const asiakas = nestedRow['asiakas'] as Asiakas;
  const tyosopimus = nestedRow['tyosuoritus'] as Tyosopimus;
  const tyokohde = nestedRow['tyokohde'] as Tyokohde;
  const urakka = nestedRow['urakka']
    ? (nestedRow['urakka'] as Urakka)
    : undefined;

  return {asiakas, tyokohde, tyosopimus, urakka};
};

export const updateTyosopimusState = async (
  id: number,
  state: string
): Promise<boolean> => {
  if (!Object.values(ContractState).includes(state as ContractState)) {
    throw new Error('Invalid contract state.');
  }

  const result = await query<Tyosopimus>(
    'UPDATE tyosuoritus SET tila = $1 WHERE id = $2',
    [state, id]
  );

  return (result.rowCount || 0) > 0;
};

export const paivitaUrakkaHinta = async (tid: number) => {
  console.log('test', tid);
};

export {validoiTyosopimus, lisaaTyosopimus, luoUrakka};
