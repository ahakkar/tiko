import {query} from './db';
import {Toimittaja} from './interfaces';

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

export {retrieveSuppliers, retrieveSupplier};
