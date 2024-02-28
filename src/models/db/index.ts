import dotenv from 'dotenv';
import {Pool, PoolClient, QueryResult} from 'pg';

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
export function query(text: string): Promise<QueryResult<any>> {
  return pool.query(text);
}

/**
 * Palauttaa yhteyden tietokantaan monivaiheisia transaktioita varten
 * @returns Promise, joka sisältää yhteyden tietokantaan
 */
export function getClient(): Promise<PoolClient> {
  return pool.connect();
}
