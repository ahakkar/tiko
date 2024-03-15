import dotenv from 'dotenv';
import {Pool, PoolClient, QueryResult, QueryResultRow} from 'pg';
import {promises as fs} from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env['POSTGRES_HOST'],
  user: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB']
    ? process.env['POSTGRES_DB']
    : process.env['POSTGRES_USER'],
  port: process.env['POSTGRES_PORT']
    ? Number(process.env['POSTGRES_PORT'])
    : undefined,
});

/**
 * Funktio yksittäisen kyselyn tekemistä varten.
 * @param text Kysely
 * @param params Parametrit
 * @returns Palauttaa Promisen, joka sisältää kyselyn tuloksen
 */
const query = async <T extends QueryResultRow>(
  text: string,
  params?: Array<string | number | boolean | null>
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

/**
 * Palauttaa yhteyden tietokantaan monivaiheisia transaktioita varten
 * @returns Promise, joka sisältää yhteyden tietokantaan
 * @deprecated Käytä mieluummin makeTransaction-funktiota
 */
const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

/**
 * Kutsuu callback-funktion tietokantatransaktion sisällä. Funktiolla
 * pääsee käsiksi client-olioon, jolla voi suorittaa kyselyitä.
 *
 * Funktion palautusarvo on Promise, joka palauttaa callback-funktion
 * palautusarvon.
 *
 * BEGIN, COMMIT suoritetaan automaattisesti. ROLLBACK suoritetaan, jos
 * callback-funktio heittää poikkeuksen.
 *
 * Esimerkki:
 * ```
 * const result = await makeTransaction(async (client) => {
 *   const result = await client.query('SELECT * FROM taulu');
 *   if (result.rows.length === 0) {
 *     throw new Error('Taulu on tyhjä'); // Tekee ROLLBACKin
 *   }
 *   if (result.rows.length === 1) {
 *     return result1.rows[0]; // Tekee COMMITin
 *   }
 *   await client.query('INSERT INTO taulu (sarake) VALUES ($1)', ['arvo']);
 *   // Funktion päättyminen tekee COMMITin
 * });
 * ```
 *
 * @param callback Toiminto, joka suoritetaan transaktion sisällä
 * @returns callback-funktion palautusarvo
 */
const makeTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/**
 * Lukee sql-kyselyn tiedostosta
 * @param fileName Tiedoston nimi
 * @returns Kysely stringinä
 */
const getQueryFromFile = async (fileName: string): Promise<string> => {
  const filePath = path.join(__dirname, '..', 'queries', fileName);
  return fs.readFile(filePath, {encoding: 'utf-8'});
};

/**
 * Hakee tietokannasta kyselyn määrittelemät tiedot
 * @param queryFile kyselytiedoston nimi
 * @returns tietokannasta haetut rivit
 */
export const getData = async <T extends QueryResultRow>(
  queryFile: string
): Promise<T[]> => {
  try {
    const queryStr = await getQueryFromFile(queryFile);
    const {rows} = await query<T>(queryStr);
    return rows;
  } catch (e) {
    throw new Error(
      `Virhe haettasessa tietoja. \nKysely: ${queryFile}\nvirheilmoitus: ${e}`
    );
  }
};

/**
 * Hakee tietokannasta kyselyn määrittelemät tiedot id:n perusteella
 * @param id id
 * @param queryFile kyselytiedoston nimi
 * @returns tietokannasta haetut rivit
 */
export const getDataById = async <T extends QueryResultRow>(
  id: number,
  queryFile: string
): Promise<T[]> => {
  try {
    const queryStr = await getQueryFromFile(queryFile);
    const {rows} = await query<T>(queryStr, [id]);
    return rows;
  } catch (e) {
    throw new Error(
      `Virhe haettasessa tietoja id:llä: ${id}\nkysely: ${queryFile}\nvirheilmoitus: ${e}`
    );
  }
};

export {query, getClient, makeTransaction, getQueryFromFile};
