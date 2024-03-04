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

const createTyokohde = async (
  tyyppi: string,
  osoite: string,
  postinumero: string,
  postitoimipaikka: string
) => {
  const result = await query<Tyokohde>(
    'INSERT INTO tyokohde (tyyppi, osoite, postinumero, postitoimipaikka) VALUES ($1, $2, $3, $4) RETURNING *',
    [tyyppi, osoite, postinumero, postitoimipaikka]
  );

  return result.rows.at(0);
};

export {getTyokohteet, getTyokohdeById, createTyokohde};
