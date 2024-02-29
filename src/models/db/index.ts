import dotenv from 'dotenv';
import {Pool, PoolClient, QueryResult, QueryResultRow} from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env['POSTGRES_HOST'],
  user: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
});

/**
 * Funktio yksittäisen kyselyn tekemistä varten.
 * @param text Kysely
 * @returns Palauttaa Promisen, joka sisältää kyselyn tuloksen
 */
export function query<T extends QueryResultRow>(
  text: string
): Promise<QueryResult<T>> {
  return pool.query<T>(text);
}

/**
 * Palauttaa yhteyden tietokantaan monivaiheisia transaktioita varten
 * @returns Promise, joka sisältää yhteyden tietokantaan
 */
export function getClient(): Promise<PoolClient> {
  return pool.connect();
}
