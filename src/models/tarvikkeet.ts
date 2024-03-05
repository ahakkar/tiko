import {PoolClient} from 'pg';
import {query, getQueryFromFile} from './db';
import {
  NewWarehouseItems,
  Tarvike,
  Toimittaja,
  VarastoTarvike,
} from './interfaces';

/**
 * Hakee kaikki varastotarvikkeet
 * @returns varastotarvikkeet
 */
const retrieveWarehouseItems = async (): Promise<VarastoTarvike[]> => {
  const result = await query<VarastoTarvike>('SELECT * FROM varastotarvike');
  return result.rows;
};

/**
 * Hakee yhden varastotarvikkeen tiedot
 * @param id varastotarvikkeen id
 * @returns yhden varastotarvikkeen tiedot
 */
const retrieveWarehouseItem = async (id: number): Promise<VarastoTarvike> => {
  const result = await query<VarastoTarvike>(
    `SELECT * FROM varastotarvike WHERE id = ${id}`
  );

  const item = result.rows.at(0);
  if (!item) {
    throw new Error(`Varastotarviketta id:llä ${id} ei löytynyt`);
  }
  return item;
};

/**
 * Hakee yhden tarvikkeen tiedot
 * @param id tarvikkeen id
 * @returns yhden tarvikkeen tiedot
 */
const retrieveItem = async (id: number): Promise<Tarvike> => {
  const result = await query<Tarvike>(`SELECT * FROM tarvike WHERE id = ${id}`);
  const item = result.rows.at(0);
  if (!item) {
    throw new Error(`Tarviketta id:llä ${id} ei löytynyt`);
  }
  return item;
};

/**
 * Lisää uudet varastotarvikkeet tietokantaan
 * @param newItems Uudet varastotarvikkeet
 */
const addNewWarehouseItems = async (
  newItems: NewWarehouseItems,
  client: PoolClient
) => {
  // Tarkista onko toimittaja jo olemassa
  const result = await client.query(
    'SELECT id FROM toimittaja WHERE nimi = $1',
    [newItems.tarvikkeet.toimittaja.toim_nimi]
  );
  const resultRow = result.rows.at(0);
  let supplierId: number | undefined = undefined;
  if (resultRow) {
    supplierId = resultRow.id;
  }

  // Nollaa toimittajan tarvikkeiden varastotilanne, jos toimittaja on jo olemassa
  if (supplierId) {
    await client.query<VarastoTarvike>(
      'UPDATE varastotarvike SET varastotilanne = 0 WHERE toimittaja_id = $1 RETURNING *',
      [supplierId]
    );
  }

  // Lisää toimittaja, jos se on uusi
  else {
    const supplier = await client.query<Toimittaja>(
      'INSERT INTO toimittaja (nimi, osoite) VALUES ($1, $2) RETURNING *',
      [
        newItems.tarvikkeet.toimittaja.toim_nimi,
        newItems.tarvikkeet.toimittaja.osoite ?? 'NULL',
      ]
    );

    const supplierRow = supplier.rows.at(0);
    if (supplierRow) {
      supplierId = supplierRow.id;
    }

    if (!supplierId) {
      throw new Error('Toimittajan lisääminen epäonnistui');
    }
  }

  // Lisää toimittajalle uudet tarvikkeet
  for (const tarvikeTiedot of newItems.tarvikkeet.tarvike) {
    const tarvike = tarvikeTiedot.ttiedot;
    await client.query<VarastoTarvike>(
      'INSERT INTO varastotarvike (toimittaja_id, nimi, merkki, tyyppi, varastotilanne, yksikko, hinta_sisaan) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        supplierId,
        tarvike.nimi,
        tarvike.merkki,
        tarvike.tyyppi,
        0,
        tarvike.yksikko,
        parseFloat(tarvike.hinta.toString()), // Varmista, että hinta on desimaaliluku
      ]
    );
  }
};

const validateNewWarehouseItems = (items: NewWarehouseItems): boolean => {
  try {
    if (!items.tarvikkeet.toimittaja) {
      console.log('VIRHE: toimittaja puuttuu');
      return false;
    }
    const toimittajaKeys = Object.keys(items.tarvikkeet.toimittaja);
    if (!toimittajaKeys.includes('toim_nimi')) {
      console.log('VIRHE: toim_nimi puuttuu');
      return false;
    }
    if (!items.tarvikkeet.tarvike) {
      console.log('VIRHE: tarvikkeet puuttuvat');
      return false;
    }
    for (const tarvike of items.tarvikkeet.tarvike) {
      if (!tarvike.ttiedot) {
        console.log('VIRHE: tarvike.ttiedot puuttuu');
        return false;
      }
      const tarvikeKeys = Object.keys(tarvike.ttiedot);
      if (
        !tarvikeKeys.includes('nimi') ||
        !tarvikeKeys.includes('merkki') ||
        !tarvikeKeys.includes('tyyppi') ||
        !tarvikeKeys.includes('hinta') ||
        !tarvikeKeys.includes('yksikko')
      ) {
        console.log('VIRHE: tarvikeen tiedot puuttuvat', tarvike.ttiedot);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log('VIRHE: XML-tiedoston validointi epäonnistui', error);
    return false;
  }
};

/**
 * Hakee tyosuorituksen tarvikkeet
 * @param tyosuoritus_id tyosuorituksen id
 * @returns tyosuorituksen tarvikkeet
 */
const getTarvikkeet = async (tyosuoritus_id: number) => {
  try {
    const queryStr = await getQueryFromFile('tyosuoritusTarvikkeet.sql');
    const {rows} = await query<Tarvike>(queryStr, [tyosuoritus_id]);

    if (rows === undefined || rows.length === 0) {
      throw new Error('Tyosuorituksia ei löytynyt.');
    }

    return rows;
  } catch (e) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
};

export {
  retrieveWarehouseItems,
  retrieveWarehouseItem,
  retrieveItem,
  addNewWarehouseItems,
  validateNewWarehouseItems,
  getTarvikkeet,
};
