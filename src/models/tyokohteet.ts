import {Tyokohde} from './interfaces';
import {query} from './db';

/**
 *
 * @returns tyokohde taulun kaikki rivit
 */
const getTyokohteet = async (): Promise<Tyokohde[]> => {
  const {rows} = await query<Tyokohde>('SELECT * FROM tyokohde');
  return rows;
};

/**
 *
 * @param id asiakkaan id
 * @returns yhden asiakkaan tiedot
 */
const getTyokohdeById = async (id: number): Promise<Tyokohde> => {
  const result = await query<Tyokohde>('SELECT * FROM tyokohde WHERE id = $1', [
    id,
  ]);

  const tyokohde = result.rows.at(0);
  if (!tyokohde) {
    throw new Error('tyokohdeta ei löytynyt.');
  }

  return tyokohde;
};

export {getTyokohteet, getTyokohdeById};
