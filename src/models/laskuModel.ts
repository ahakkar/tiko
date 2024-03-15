import {getData, query} from './dbModel';
import {Lasku, LaskuAsiakasKohde} from './interfaces';

/**
 * Tarkistaa onko tyokohteen tiedot validit
 * @param a Tyokohde
 * @returns true jos tiedot ovat validit
 */
export const validoiLasku = (n: Lasku): Boolean => {
  // TODO hienompi laskun tietojen validointi..
  if (
    Number.isNaN(n['tyosuoritus_id']) ||
    Number.isNaN(n['summa']) ||
    n['pvm'] === null ||
    n['era_pvm'] === null
  ) {
    return false;
  }

  return true;
};

/**
 * Lisää uuden laskun tietokantaan
 * @param a Laskun
 * @returns luodun laskun tiedot
 */
export const lisaaLasku = async (n: Lasku): Promise<Lasku> => {
  const pvm = n['pvm'].toISOString();
  const era_pvm = n['era_pvm'].toISOString();

  if (
    pvm === null ||
    era_pvm === null ||
    pvm === undefined ||
    era_pvm === undefined
  ) {
    throw new Error('Päivämäärä ei saa olla tyhjä.');
  }

  const result = await query<Lasku>(
    'INSERT INTO lasku (tyosuoritus_id, summa, pvm, era_pvm) VALUES ($1, $2, $3, $4) RETURNING *',
    [n['tyosuoritus_id'], n['summa'], pvm, era_pvm]
  );

  if (!result.rows[0]) {
    throw new Error('Laskua ei voitu lisätä.');
  }

  return result.rows[0];
};

/**
 * Hakee custom-määrän tietoja joka laskusta kaikki laskut-näkymää varten
 * @returns lista laskuista
 */
export const getLaskuAsiakasKohde = async (): Promise<LaskuAsiakasKohde[]> => {
  const data: LaskuAsiakasKohde[] = await getData<LaskuAsiakasKohde>(
    'laskutAsiakasKohde.sql'
  );
  return data;
};
