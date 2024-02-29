import {QueryResultRow} from 'pg';
import {query} from './db';

interface VarastoTarvike extends QueryResultRow {
  id: number;
  toimittaja_id: number;
  nimi: string;
  merkki: string;
  tyyppi: string;
  varastotilanne: number;
  yksikko: string;
  hinta_sisaan: number;
}

interface Tarvike extends QueryResultRow {
  id: number;
  varastotarvike_id: number;
  tyosuoritus_id: number;
  maara: number;
  hinta_ulos: number;
  pvm: Date;
  aleprosentti: number;
  alv_prosentti: number;
  hinta: number;
  alv: number;
}

interface Toimittaja extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
}

/**
 * Kyselyt:
 * - Kaikki varastotarvikkeet (joiden määrä > 0 ?)
 * - Kaikki yhden työsuorituksen tarvikkeet
 * - Toimittajan tiedot id:llä
 * - Varastotarvike id:llä
 */

async function retrieveWarehouseItems(): Promise<VarastoTarvike[]> {
  const result = await query<VarastoTarvike>('SELECT * FROM varastotarvike');
  return result.rows;
}

async function retrieveWarehouseItem(id: number): Promise<VarastoTarvike> {
  const result = await query<VarastoTarvike>(
    `SELECT * FROM varastotarvike WHERE id = ${id}`
  );

  const item = result.rows.at(0);
  if (!item) {
    throw new Error(`Varastotarviketta id:llä ${id} ei löytynyt`);
  }
  return item;
}

async function retrieveItem(id: number): Promise<Tarvike> {
  const result = await query<Tarvike>(`SELECT * FROM tarvike WHERE id = ${id}`);
  const item = result.rows.at(0);
  if (!item) {
    throw new Error(`Tarviketta id:llä ${id} ei löytynyt`);
  }
  return item;
}

async function retrieveSupplier(id: number): Promise<Toimittaja> {
  const result = await query<Toimittaja>(
    `SELECT * FROM toimittaja WHERE id = ${id}`
  );

  const supplier = result.rows.at(0);
  if (!supplier) {
    throw new Error(`Toimittajaa id:llä ${id} ei löytynyt`);
  }
  return supplier;
}

export {
  VarastoTarvike,
  Tarvike,
  Toimittaja,
  retrieveWarehouseItems,
  retrieveWarehouseItem,
  retrieveItem,
  retrieveSupplier,
};
