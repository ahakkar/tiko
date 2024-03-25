import Decimal from 'decimal.js';
import {QueryResultRow} from 'pg';
import {query, getQueryFromFile, getDataById} from './dbModel';
import {
  KokoTyosuoritus,
  Asiakas,
  Tyokohde,
  Urakka,
  Tarvike,
  TyosopimusJaLaskut,
  Tyosopimus,
  KokoTyosopimus,
  TyosopimusJaLasku,
  KokoLasku,
  AlvErittely,
} from './interfaces';
import {CONTRACT_STATES} from '../constants';

/**
 * Hakee tietokannasta työsuorituksien perustiedot
 * @returns tyosuorituksien tiedot
 */
export const getTyosopimukset = async (): Promise<KokoTyosopimus[]> => {
  const queryStr = await getQueryFromFile('kaikkiTyosopimukset.sql');
  const {rows} = await query(queryStr);

  if (rows.length === 0) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  return mapRowsToTyosopimukset(rows);
};

/**
 * Hakee kaiken työsuoritukseen liittyvän tiedon tietokannasta
 * @param id tyosuorituksen id
 * @returns tyosuoritukseen liittyvät tiedot
 */
export const getTyosopimusJaLaskut = async (
  tyosopimus_id: number
): Promise<TyosopimusJaLaskut> => {
  const result: TyosopimusJaLaskut = {} as TyosopimusJaLaskut;
  const tyosopimus = await getTyoSopimusData(tyosopimus_id);
  if (tyosopimus[0] === undefined) {
    throw new Error('Työsopimuksia ei löytynyt.');
  }
  const tyosuoritukset = await getDataById<KokoTyosuoritus>(
    tyosopimus_id,
    'kokoTyosopimus.sql'
  );
  const tarvikkeet = await getDataById<Tarvike>(
    tyosopimus_id,
    'tyosopimusTarvikkeet.sql'
  );
  if (tyosopimus[0]?.tyosopimus.urakka_id) {
    const urakka_result = await getDataById<Urakka>(
      tyosopimus[0].tyosopimus.urakka_id,
      'urakka.sql'
    );
    if (urakka_result[0] !== undefined) {
      result.urakka = urakka_result[0];
    }
  }

  result.tyosopimus = tyosopimus[0]?.tyosopimus;
  result.asiakas = tyosopimus[0]?.asiakas;
  result.tyokohde = tyosopimus[0]?.tyokohde;
  const res = await query<KokoLasku>(
    'SELECT * FROM koko_lasku WHERE tyosuoritus_id = $1',
    [tyosopimus_id]
  );
  result.laskut = res.rows;
  result.tyosuoritukset = tyosuoritukset;
  result.tarvikkeet = tarvikkeet;
  result.kokonaissumma = sumKokonaissumma(
    tyosopimus,
    tyosuoritukset,
    tarvikkeet
  );
  result.is_urakka = !!result.tyosopimus.urakka_id;
  result.is_tuntihinta = !result.tyosopimus.urakka_id;

  return result;
};

/**
 * Hakee työsuorituksen ja laskun
 * @param id tyosuorituksen id
 * @returns tyosuoritukseen liittyvät tiedot
 */
export const getTyosopimusJaLasku = async (
  tyosuoritusId: number,
  laskuId: number
): Promise<TyosopimusJaLasku> => {
  console.log('tyosuoritusId', tyosuoritusId, 'laskuId', laskuId);
  const result: TyosopimusJaLasku = {} as TyosopimusJaLasku;
  const tyosopimus = await getTyoSopimusData(tyosuoritusId);

  if (tyosopimus[0] === undefined) {
    throw new Error('Työsopimuksia ei löytynyt.');
  }
  const tyosuoritukset = await getDataById<KokoTyosuoritus>(
    tyosuoritusId,
    'kokoTyosopimus.sql'
  );
  const tarvikkeet = await getDataById<Tarvike>(
    tyosuoritusId,
    'tyosopimusTarvikkeet.sql'
  );
  if (tyosopimus[0]?.tyosopimus.urakka_id) {
    const urakka_result = await getDataById<Urakka>(
      tyosopimus[0].tyosopimus.urakka_id,
      'urakka.sql'
    );
    if (urakka_result[0] !== undefined) {
      result.urakka = urakka_result[0];
    }
  }

  const {rows: lasku} = await query<KokoLasku>(
    'SELECT * FROM koko_lasku WHERE id = $1',
    [laskuId]
  );

  const alv_erittely = await getDataById<AlvErittely>(
    tyosuoritusId,
    'tyosopimusAlvErittely.sql'
  );
  if (alv_erittely !== undefined) {
    result.alv_erittely = alv_erittely;
  }

  console.log('alv_erittely', alv_erittely);

  result.tyosopimus = tyosopimus[0]?.tyosopimus;
  result.asiakas = tyosopimus[0]?.asiakas;
  result.tyokohde = tyosopimus[0]?.tyokohde;
  result.lasku = lasku[0] ? lasku[0] : undefined;
  result.tyosuoritukset = tyosuoritukset;
  result.tarvikkeet = tarvikkeet;
  result.kokonaissumma = sumKokonaissumma(
    tyosopimus,
    tyosuoritukset,
    tarvikkeet
  );
  result.is_urakka = !!result.tyosopimus.urakka_id;
  result.is_tuntihinta = !result.tyosopimus.urakka_id;

  return result;
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

const getTyoSopimusData = async (id: number): Promise<KokoTyosopimus[]> => {
  const queryStr = await getQueryFromFile('tyosuoritus.sql');
  const {rows} = await query(queryStr, [id]);

  if (rows === undefined || rows.length === 0) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  const ts = mapRowsToTyosopimukset(rows);

  if (ts[0] === undefined) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  return ts;
};

/**
 * Laskee tuntihintojen ja tarvikkeiden yhteishinnan
 * @param tuntihinnat
 * @param tarvikkeet
 * @returns työsuorituksen yhteishinta
 */
const sumKokonaissumma = (
  tyosopimus: KokoTyosopimus[],
  tyosuoritukset: KokoTyosuoritus[],
  tarvikkeet: Tarvike[]
): string => {
  let summa = new Decimal(0);

  if (tyosopimus[0]?.urakka.hinta_yhteensa) {
    summa = summa.plus(new Decimal(tyosopimus[0]?.urakka.hinta_yhteensa));
  }
  for (const tyosuoritus of tyosuoritukset) {
    summa = summa.plus(new Decimal(tyosuoritus.hinta_yhteensa));
  }
  for (const tarvike of tarvikkeet) {
    summa = summa.plus(new Decimal(tarvike.hinta_yhteensa));
  }

  return summa.toFixed(2);
};

/**
 * Muuntaa tietokannasta tulleet rivit Tyosuoritukset-interfaceksi
 * TODO korvaa utils/parse.ts tyylin funktiolla
 * @param rows tietokannasta tulleet rivit
 * @returns Tyosuoritus-olioiden taulukko
 */
function mapRowsToTyosopimukset(rows: QueryResultRow[]): KokoTyosopimus[] {
  const result: KokoTyosopimus[] = [];

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

    result.push({
      asiakas,
      tyokohde,
      tyosopimus,
      urakka,
    });
  }
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
