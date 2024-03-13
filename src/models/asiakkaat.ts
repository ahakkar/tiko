import {Asiakas} from './interfaces';
import {query} from './db';

/**
 *
 * @returns Asiakas taulun kaikki rivit
 */
const getAsiakkaat = async (): Promise<Asiakas[]> => {
  const {rows} = await query<Asiakas>('SELECT * FROM asiakas');
  return rows;
};

/**
 *
 * @param id asiakkaan id
 * @returns yhden asiakkaan tiedot
 */
const getAsiakasById = async (id: number): Promise<Asiakas> => {
  const result = await query<Asiakas>('SELECT * FROM asiakas WHERE id = $1', [
    id,
  ]);

  const asiakas = result.rows.at(0);
  if (!asiakas) {
    throw new Error('Asiakasta ei löytynyt.');
  }

  return asiakas;
};

/**
 * Tarkistaa onko asiakkaan tiedot validit
 * @param a Asiakas
 * @returns true jos tiedot ovat validit
 */
const validoiAsiakas = (a: Asiakas): Boolean => {
  // TODO hienompi asiakkaan tietojen validointi
  if (
    a['nimi'] === '' ||
    a['osoite'] === '' ||
    a['postinumero'] === '' ||
    a['postitoimipaikka'] === '' ||
    a['sahkoposti'] === '' ||
    a['puhelinnumero'] === ''
  ) {
    return false;
  }

  return true;
};

/**
 * Lisää uuden asiakkaan tietokantaan
 * @param a Asiakas
 * @returns luodun asiakkaan tiedot
 */
const lisaaAsiakas = async (a: Asiakas): Promise<Asiakas> => {
  const result = await query<Asiakas>(
    'INSERT INTO asiakas (nimi, osoite, postinumero, postitoimipaikka, sahkoposti, puhelinnumero) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      a['nimi'],
      a['osoite'],
      a['postinumero'],
      a['postitoimipaikka'],
      a['sahkoposti'],
      a['puhelinnumero'],
    ]
  );

  if (!result.rows[0]) {
    throw new Error('Asiakasta ei voitu luoda.');
  }

  return result.rows[0];
};

export {getAsiakkaat, getAsiakasById, lisaaAsiakas, validoiAsiakas};
