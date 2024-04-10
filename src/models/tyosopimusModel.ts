import {QueryResultRow} from 'pg';
import {query, getQueryFromFile, getDataById} from './dbModel';
import {
  Asiakas,
  Tyokohde,
  Urakka,
  Tyosopimus,
  KokoTyosopimus,
  Summat,
  AlvErittely,
  Tyosuoritus,
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

export const paivitaProsentti = async (
  id: number,
  tyyppi: string,
  prosenttiStr: string
): Promise<boolean> => {
  const prosentti = parseFloat(prosenttiStr);
  const urakkaResult = await query<Tyosuoritus>(
    'SELECT urakka_id FROM tyosuoritus WHERE id = $1',
    [id]
  );

  if (urakkaResult.rows.length === 0 || urakkaResult.rows[0] === undefined) {
    return false;
  }

  const urakka_id = urakkaResult.rows[0]['urakka_id'];

  if (Number.isNaN(prosentti)) {
    return false;
  } else if ((tyyppi === 'aleprosentti' && prosentti < 0) || prosentti > 1) {
    return false;
  } else if (
    (tyyppi === 'korotusprosentti' && prosentti < 0) ||
    prosentti > 9
  ) {
    return false;
  }

  let queryStr = '';

  switch (tyyppi) {
    case 'aleprosentti':
      queryStr = 'UPDATE urakka SET aleprosentti = $1 WHERE id = $2';
      break;
    case 'korotusprosentti':
      queryStr = 'UPDATE urakka SET korotusprosentti = $1 WHERE id = $2';
      break;
    default:
      return false;
  }

  const result = await query<Urakka>(queryStr, [
    prosenttiStr,
    urakka_id.toString(),
  ]);

  return (result.rowCount || 0) > 0;
};

/**
 * Hakee yhden työsopimuksen alv-erittelyn
 * @param tyosopimus_id
 * @returns
 */
export const haeAlvErittely = async (
  tyosopimus_id: number
): Promise<AlvErittely[]> => {
  const erittely = await getDataById<AlvErittely>(
    tyosopimus_id,
    'tyosopimusAlvErittely.sql'
  );

  return erittely;
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
    'INSERT INTO urakka (lahtohinta, aleprosentti, korotusprosentti) VALUES ($1, $2, $3) RETURNING *',
    [0, 0, 0]
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

/**
 * Laskee hinnan urakalle tuntitöiden ja tarvikkeiden perusteella,
 * ja päivittää sen tietokantaan
 * @param tid työsopimuksen ID
 */
export const paivitaUrakkaHinta = async (tyosopimus_id: number) => {
  const dataa = await getDataById(tyosopimus_id, 'laskeSummat.sql');
  const {rows} = await query<Tyosopimus>(
    'SELECT urakka_id FROM tyosuoritus WHERE id = $1;',
    [tyosopimus_id.toString()]
  );

  if (dataa[0] !== undefined && rows[0] !== undefined) {
    const kokonaissumma = dataa[0]['alehinta'];
    const urakka_id = rows[0]['urakka_id'];

    await query<Tyosopimus>(
      'UPDATE urakka SET lahtohinta = $1 WHERE id = $2;',
      [kokonaissumma, urakka_id]
    );
  }
};

export const laskeSopimusHinta = async (
  tyosopimus_id: number
): Promise<Summat | undefined> => {
  const rows = await getDataById<Summat>(tyosopimus_id, 'laskeSummat.sql');
  if (rows[0] !== undefined) {
    return rows[0];
  }
  return undefined;
};

export {validoiTyosopimus, lisaaTyosopimus, luoUrakka};
