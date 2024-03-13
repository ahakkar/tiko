import {query} from './dbModel';
import {Tuntihinta, Tuntihintatyyppi} from './interfaces';

/**
 * Hakee tietokannasta tuntihintatyypit
 * @returns tuntihinnat
 */
export const getTuntihintatyypit = async (): Promise<Tuntihintatyyppi[]> => {
  const {rows} = await query<Tuntihintatyyppi>(
    'SELECT * FROM tuntihintatyyppi'
  );

  return rows;
};

/**
 * Tarkistaa onko työsuorituksen tiedot validit
 * @param a Tyokohde
 * @returns true jos tiedot ovat validit
 */
export const validoiTyosuoritus = (n: Tuntihinta): Boolean => {
  // TODO hienompi työkohteen tietojen validointi
  if (
    Number.isNaN(n['tyosuoritus_id']) ||
    Number.isNaN(n['tuntihintatyyppi_id']) ||
    Number.isNaN(n['alv_prosentti']) ||
    Number.isNaN(n['aleprosentti']) ||
    Number.isNaN(n['tunnit'])
  ) {
    return false;
  }

  return true;
};

export const lisaaTyosuoritus = async (n: Tuntihinta): Promise<Tuntihinta> => {
  const result = await query<Tuntihinta>(
    'INSERT INTO tuntihinta (tyosuoritus_id, tuntihintatyyppi_id, alv_prosentti, aleprosentti, tunnit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      n['tyosuoritus_id'],
      n['tuntihintatyyppi_id'],
      n['alv_prosentti'],
      n['aleprosentti'],
      n['tunnit'],
    ]
  );

  if (!result.rows[0]) {
    throw new Error('Työsuorituksen lisäys epäonnistui. ' + n);
  }

  return result.rows[0];
};
