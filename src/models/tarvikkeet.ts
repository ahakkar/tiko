import { query } from './db';

interface VarastoTarvike {
  id: number;
  toimittajaId: number;
  nimi: string;
  merkki: string;
  tyyppi: string;
  varastotilanne: number;
  yksikkö: string;
  hintaSisään: number;
}

interface Tarvike {
  id: number;
  varastotarvikeId: number;
  työsuoritusId: number;
  maara: number;
  hintaUlos: number;
  pvm: Date;
  aleprosentti: number;
  alvProsentti: number;
  hinta: number;
  alv: number;
}

interface Toimittaja {
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
    const result = await query('SELECT * FROM varastotarvike');
    return result.rows.map((row: any): VarastoTarvike => {
      return {
        id: row.id,
        toimittajaId: row.toimittaja_id,
        nimi: row.nimi,
        merkki: row.merkki,
        tyyppi: row.tyyppi,
        varastotilanne: row.varastotilanne,
        yksikkö: row.yksikko,
        hintaSisään: row.hinta_sisaan,
      };
    });
}

async function retrieveWarehouseItem(id: number): Promise<VarastoTarvike> {
    const result = await query(`SELECT * FROM varastotarvike WHERE id = ${id}`);
    const item = result.rows.map((row: any): VarastoTarvike => {
        return {
            id: row.id,
            toimittajaId: row.toimittaja_id,
            nimi: row.nimi,
            merkki: row.merkki,
            tyyppi: row.tyyppi,
            varastotilanne: row.varastotilanne,
            yksikkö: row.yksikko,
            hintaSisään: row.hinta_sisaan,
        };
    })[0];
    if (!item) {
        throw new Error(`Varastotarviketta id:llä ${id} ei löytynyt`);
    }
    return item;
}

async function retrieveItem(id: number): Promise<Tarvike> {
    const result = await query(`SELECT * FROM tarvike WHERE id = ${id}`);
    const item = result.rows.map(row => {
        return {
            id: row.id,
            varastotarvikeId: row.varastotarvike_id,
            työsuoritusId: row.tyosuoritus_id,
            maara: row.maara,
            hintaUlos: row.hinta_ulos,
            pvm: row.pvm,
            aleprosentti: row.aleprosentti,
            alvProsentti: row.alv_prosentti,
            hinta: row.hinta,
            alv: row.alv
        }
    }).at(0);
    if (!item) {
        throw new Error(`Tarviketta id:llä ${id} ei löytynyt`);
    }
    return item;
}

async function retrieveSupplier(id: number): Promise<Toimittaja> {
    const result = await query(`SELECT * FROM toimittaja WHERE id = ${id}`);
    const supplier = result.rows.map(row => {
        return {
            id: row.id,
            nimi: row.nimi,
            osoite: row.osoite
        }
    }).at(0);
    if (!supplier) {
        throw new Error(`Toimittajaa id:llä ${id} ei löytynyt`);
    }
    return supplier;
}

export {VarastoTarvike, Tarvike, Toimittaja, retrieveWarehouseItems, retrieveWarehouseItem, retrieveItem, retrieveSupplier};
