import {PoolClient} from 'pg';
import {getData, makeTransaction, query} from './dbModel';
import {KokoLasku, Lasku, LaskuAsiakasKohde} from './interfaces';

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

export const addMuistutusLasku = async (
  eraPvm: string,
  edellinenId: number
) => {
  const res = await makeTransaction(async (client: PoolClient) => {
    const {rows} = await client.query<Lasku>(
      'SELECT tyosuoritus_id, summa FROM lasku WHERE id = $1',
      [edellinenId]
    );
    const edellinen = rows.at(0);
    if (!edellinen) {
      throw new Error('Edellistä laskua ei löydetty');
    }

    const {rows: newLasku} = await client.query<Lasku>(
      'INSERT INTO lasku (tyosuoritus_id, edellinen_lasku, summa, era_pvm) VALUES ($1, $2, $3, $4) RETURNING *',
      [edellinen.tyosuoritus_id, edellinenId, edellinen.summa, eraPvm]
    );
    return newLasku;
  });
  if (res.at(0)) {
    return res;
  }
  throw new Error('Uutta laskua ei luotu');
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

export const getKokoLasku = async (id: number): Promise<KokoLasku> => {
  const {rows} = await query<KokoLasku>(
    'SELECT * FROM koko_lasku WHERE lasku_id = $1',
    [id]
  );
  const lasku = rows.at(0);
  if (lasku) {
    return lasku;
  } else {
    throw new Error('Laskua ei löydetty.');
  }
};

export const hasMuistutusLasku = async (id: number): Promise<boolean> => {
  const {rows} = await query(
    'SELECT DISTINCT id FROM lasku WHERE edellinen_lasku = $1',
    [id]
  );
  if (rows.length > 0) {
    return true;
  }
  return false;
};
