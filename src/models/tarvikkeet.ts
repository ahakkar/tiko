import {QueryResultRow} from 'pg';
import {query, getClient, getQueryFromFile} from './db';

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

interface NewWarehouseItems {
  tarvikkeet: {
    toimittaja: {
      toim_nimi: string;
      osoite: string;
    };
    tarvike: {
      ttiedot: {
        nimi: string;
        merkki: string;
        tyyppi: string;
        hinta: number;
        yksikko: string;
      };
    }[];
  };
}

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

async function addNewWarehouseItems(newItems: NewWarehouseItems) {
  const client = await getClient();
  try {
    client.query('BEGIN');

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

    client.query('COMMIT');
  } catch (error) {
    client.query('ROLLBACK');
    throw error;
  }
}

function validateNewWarehouseItems(items: NewWarehouseItems): boolean {
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
}

async function getTarvikkeet(tyosuoritus_id: number) {
  try {
    const queryStr = await getQueryFromFile('getTyosuoritusTarvikkeet.sql');
    const {rows} = await query<Tarvike>(queryStr, [tyosuoritus_id]);

    if (rows === undefined || rows.length === 0) {
      throw new Error('Tyosuorituksia ei löytynyt.');
    }

    return rows;
  } catch (e) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
}

export {
  VarastoTarvike,
  Tarvike,
  Toimittaja,
  NewWarehouseItems,
  retrieveWarehouseItems,
  retrieveWarehouseItem,
  retrieveItem,
  retrieveSupplier,
  addNewWarehouseItems,
  validateNewWarehouseItems,
  getTarvikkeet,
};
