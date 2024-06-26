import {PoolClient} from 'pg';
import {query, getQueryFromFile, getDataById} from './dbModel';
import {
  NewWarehouseItems,
  Tarvike,
  Toimittaja,
  VarastoTarvike,
} from './interfaces';

// TODO hieno geneerinen funktio näille sadalle samanlaiselle validoi/lisää
// funktiolle eri modeleissa

/**
 * Tarkistaa onko tyokohteen tiedot validit
 * @param a Tyokohde
 * @returns true jos tiedot ovat validit
 */
export const validoiTarvike = (n: Tarvike): Boolean => {
  // TODO hienompi tarvikkeen tietojen validointi..
  if (
    Number.isNaN(n['tyosuoritus_id']) ||
    Number.isNaN(n['varastotarvike_id']) ||
    Number.isNaN(n['maara']) ||
    Number.isNaN(n['hinta_ulos']) ||
    // Ei validoida juuri controllerin luomaa päivää..
    Number.isNaN(n['aleprosentti']) ||
    Number.isNaN(n['alv_prosentti'])
  ) {
    return false;
  }

  return true;
};

/**
 * Lisää uuden työkohteen tietokantaan
 * @param a Työkohde
 * @returns luodun työkohteen tiedot
 */
export const lisaaTarvike = async (n: Tarvike): Promise<Tarvike> => {
  const result = await query<Tarvike>(
    'INSERT INTO tarvike (tyosuoritus_id, varastotarvike_id, maara, hinta_ulos, aleprosentti, alv_prosentti) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      n['tyosuoritus_id'],
      n['varastotarvike_id'],
      n['maara'],
      n['hinta_ulos'],
      n['aleprosentti'],
      n['alv_prosentti'],
    ]
  );

  if (!result.rows[0]) {
    throw new Error('Tarviketta ei voitu lisätä.');
  }

  return result.rows[0];
};

export const poistaTarvike = async (
  tyosopimus_id: string,
  tarvike_id: string
): Promise<void> => {
  const result = await query(
    'DELETE FROM tarvike WHERE tyosuoritus_id = $1 AND id = $2 RETURNING *',
    [tyosopimus_id, tarvike_id]
  );
  console.log(result.rowCount);
};

/**
 * Hakee kaikki varastotarvikkeet
 * @param archived arkistoitu 'TRUE' tai 'FALSE'
 * @returns varastotarvikkeet
 */
export const retrieveWarehouseItems = async (
  archived: string
): Promise<VarastoTarvike[]> => {
  const result = await getDataById<VarastoTarvike>(
    archived,
    'varastotarvikkeet.sql'
  );
  return result;
};

/**
 * Hakee yhden varastotarvikkeen tiedot
 * @param id varastotarvikkeen id
 * @returns yhden varastotarvikkeen tiedot
 */
const retrieveWarehouseItem = async (id: number): Promise<VarastoTarvike> => {
  const result = await query<VarastoTarvike>(
    'SELECT * FROM varastotarvike WHERE id = $1',
    [id]
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

const updateWarehouseItem = async (id: number, vanhentunut: boolean) => {
  await query<VarastoTarvike>(
    'UPDATE varastotarvike SET vanhentunut = $1 WHERE id = $2',
    [vanhentunut, id]
  );
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

  // Muuta toimittajan aikaisemmat tavarat vanhentuneiksi, jos toimittaja on jo olemassa
  if (supplierId) {
    await client.query<VarastoTarvike>(
      'UPDATE varastotarvike SET vanhentunut = TRUE WHERE toimittaja_id = $1',
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
 * Hakee yhteen työsopimukseen kuuluvat tarvikkeet
 * @param työsopimus_id
 * @returns tarvikkeet
 */
export const haeTarvikkeet = async (
  työsopimus_id: number
): Promise<Tarvike[]> => {
  const queryStr = await getQueryFromFile('tyosopimusTarvikkeet.sql');
  const {rows} = await query<Tarvike>(queryStr, [työsopimus_id]);

  return rows;
};

export {
  retrieveWarehouseItem,
  retrieveItem,
  updateWarehouseItem,
  addNewWarehouseItems,
  validateNewWarehouseItems,
};
