import Decimal from 'decimal.js';
import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './dbModel';
import {
  KokoTyosuoritus,
  Tyosuoritukset,
  Tyosuoritus,
  Asiakas,
  Tyokohde,
  Urakka,
  Lasku,
  Tuntihinta,
  Tarvike,
} from './interfaces';

/**
 * Hakee tietokannasta työsuorituksien perustiedot
 * @returns tyosuorituksien tiedot
 */
const getTyosopimukset = async (): Promise<Tyosuoritukset[]> => {
  const queryStr = await getQueryFromFile('tyosuoritukset.sql');
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
const getTyosopimus = async (id: number): Promise<KokoTyosuoritus> => {
  const result: KokoTyosuoritus = {} as KokoTyosuoritus;
  const tyosuoritus = await getTyoSopimusData(id);
  if (tyosuoritus[0] === undefined) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
  const tuntihinnat = await getDataById<Tuntihinta>(
    id,
    'tyosuoritusTuntihinnat.sql'
  );
  const tarvikkeet = await getDataById<Tarvike>(
    id,
    'tyosuoritusTarvikkeet.sql'
  );

  result.tyosuoritus = tyosuoritus[0]?.tyosuoritus;
  result.asiakas = tyosuoritus[0]?.asiakas;
  result.tyokohde = tyosuoritus[0]?.tyokohde;
  result.laskut = await getDataById<Lasku>(id, 'tyosuoritusLaskut.sql');
  result.tuntihinnat = tuntihinnat;
  result.tarvikkeet = tarvikkeet;
  result.kokonaissumma = sumKokonaissumma(tyosuoritus, tuntihinnat, tarvikkeet);

  return result;
};

/**
 * Tarkistaa onko työsuorituksen tiedot validit
 * @param a Tyosuoritus
 * @returns true jos tiedot ovat validit
 */
const validoiTyosopimus = (t: Tyosuoritus): Boolean => {
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
const lisaaTyosopimus = async (ts: Tyosuoritus): Promise<Tyosuoritus> => {
  const result = await query<Tyosuoritus>(
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
 * Hakee tietokannasta kyselyn määrittelemät tiedot id:n perusteella
 * @param id tyosuorituksen id
 * @param queryFile kyselytiedoston nimi
 * @returns tietokannasta haetut rivit
 */
const getDataById = async <T extends QueryResultRow>(
  id: number,
  queryFile: string
): Promise<T[]> => {
  try {
    const queryStr = await getQueryFromFile(queryFile);
    const {rows} = await query<T>(queryStr, [id]);
    return rows;
  } catch (e) {
    throw new Error(
      `Virhe haettasessa työsuorituksen tietoja id:llä: ${id}\nkysely: ${queryFile}\nvirheilmoitus: ${e}`
    );
  }
};

const getTyoSopimusData = async (id: number): Promise<Tyosuoritukset[]> => {
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
  tyosuoritus: Tyosuoritukset[],
  tuntihinnat: Tuntihinta[],
  tarvikkeet: Tarvike[]
): string => {
  let summa = new Decimal(0);

  if (tyosuoritus[0]?.urakka.hinta_yhteensa) {
    summa = summa.plus(new Decimal(tyosuoritus[0]?.urakka.hinta_yhteensa));
  }
  for (const tuntihinta of tuntihinnat) {
    summa = summa.plus(new Decimal(tuntihinta.hinta_yhteensa));
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
function mapRowsToTyosopimukset(rows: QueryResultRow[]): Tyosuoritukset[] {
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

export {
  getTyosopimukset,
  getTyosopimus,
  validoiTyosopimus,
  lisaaTyosopimus,
  luoUrakka,
};
