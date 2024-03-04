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
 * const results = await makeTransaction(async (client) => {
 *   const result1 = await client.query('SELECT * FROM taulu1');
 *   if (!result1.rows.length) {
 *     throw new Error('Taulu1 on tyhjä');
 *   }
 *   const result2 = await client.query('SELECT * FROM taulu2');
 *   return {result1, result2};
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

export {query, getClient, makeTransaction, getQueryFromFile};
