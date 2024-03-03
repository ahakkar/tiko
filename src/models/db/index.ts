import dotenv from 'dotenv';
import {Pool, PoolClient, QueryResult, QueryResultRow} from 'pg';

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
export function query<T extends QueryResultRow>(
  text: string,
  params?: Array<string | number | boolean | null>
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Palauttaa yhteyden tietokantaan monivaiheisia transaktioita varten
 * @returns Promise, joka sisältää yhteyden tietokantaan
 */
export function getClient(): Promise<PoolClient> {
  return pool.connect();
}
