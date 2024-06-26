import {Tyokohde} from './interfaces';
import {query} from './dbModel';

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

/**
 * Tarkistaa onko tyokohteen tiedot validit
 * @param a Tyokohde
 * @returns true jos tiedot ovat validit
 */
const validoiTyokohde = (n: Tyokohde): Boolean => {
  // TODO hienompi työkohteen tietojen validointi
  if (
    n['tyyppi'] === '' ||
    n['osoite'] === '' ||
    n['postinumero'] === '' ||
    n['postitoimipaikka'] === ''
  ) {
    return false;
  }

  return true;
};

/**
 * Lisää uuden työkohteen tietokantaan
 * @param a Työkohde
 * @returns luodun työkohteen tiedot
 */
const lisaaTyokohde = async (n: Tyokohde): Promise<Tyokohde> => {
  const result = await query<Tyokohde>(
    'INSERT INTO tyokohde (tyyppi, osoite, postinumero, postitoimipaikka) VALUES ($1, $2, $3, $4) RETURNING *',
    [n['tyyppi'], n['osoite'], n['postinumero'], n['postitoimipaikka']]
  );

  if (!result.rows[0]) {
    throw new Error('Työkohdetta ei voitu luoda.');
  }

  return result.rows[0];
};

export {getTyokohteet, getTyokohdeById, lisaaTyokohde, validoiTyokohde};
