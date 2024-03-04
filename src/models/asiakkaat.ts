import {Asiakas} from './interfaces';
import {query} from './db';

/**
 *
 * @returns Asiakas taulun kaikki rivit
 */
async function getAsiakkaat(): Promise<Asiakas[]> {
  const {rows} = await query<Asiakas>('SELECT * FROM asiakas');
  return rows;
}

/**
 *
 * @param id asiakkaan id
 * @returns yhden asiakkaan tiedot
 */
async function getAsiakasById(id: number): Promise<Asiakas> {
  const result = await query<Asiakas>('SELECT * FROM asiakas WHERE id = $1', [
    id,
  ]);

  const asiakas = result.rows.at(0);
  if (!asiakas) {
    throw new Error('Asiakasta ei löytynyt.');
  }

  return asiakas;
}

export {getAsiakkaat, getAsiakasById};
