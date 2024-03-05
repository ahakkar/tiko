import {flatToNestedObject, NestedObject} from '../utils/parse';
import {getQueryFromFile, query} from './db';
import {Toimittaja} from './interfaces';

/**
 * Hakee kaikkien toimittajien tiedot
 * @returns kaikkien toimittajien tiedot
 */
const retrieveSuppliers = async (): Promise<Toimittaja[]> => {
  const {rows: suppliers} = await query<Toimittaja>('SELECT * FROM toimittaja');
  return suppliers;
};

/**
 * Hakee yhden toimittajan tiedot
 * @param id toimittajan id
 * @returns yhden toimittajan tiedot
 */
const retrieveSupplier = async (id: number): Promise<Toimittaja> => {
  const result = await query<Toimittaja>(
    `SELECT * FROM toimittaja WHERE id = ${id}`
  );

  const supplier = result.rows.at(0);
  if (!supplier) {
    throw new Error(`Toimittajaa id:llä ${id} ei löytynyt`);
  }
  return supplier;
};

const retrieveUsedItemsBySupplier = async (
  supplierId: number
): Promise<NestedObject[]> => {
  const queryStr = await getQueryFromFile(
    'kaytetytTarvikkeetToimittajanMukaan.sql'
  );
  const {rows: result} = await query(queryStr, [supplierId]);
  return result.map(flatToNestedObject);
};

export {retrieveSuppliers, retrieveSupplier, retrieveUsedItemsBySupplier};
