import Decimal from 'decimal.js';
import {QueryResultRow} from 'pg';
import {query, getQueryFromFile} from './db';
import {
  KokoTyosuoritus,
  Tyosuoritukset,
  Tyosuoritus,
  Asiakas,
  Tyokohde,
  Urakka,
  Lasku,
  Tuntihinta,
  Tarvike,
} from './interfaces';

/**
 * Hakee tietokannasta työsuorituksien perustiedot
 * @returns tyosuorituksien tiedot
 */
const getTyosuoritukset = async (): Promise<Tyosuoritukset[]> => {
  let queryStr = '';

  queryStr = await getQueryFromFile('tyosuoritukset.sql');

  const {rows} = await query(queryStr);

  if (rows.length === 0) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  return mapRowsToTyosuoritukset(rows);
};

/**
 * Hakee kaiken työsuoritukseen liittyvän tiedon tietokannasta
 * @param id tyosuorituksen id
 * @returns tyosuoritukseen liittyvät tiedot
 */
const getTyosuoritus = async (id: number): Promise<KokoTyosuoritus> => {
  const result: KokoTyosuoritus = {} as KokoTyosuoritus;
  const tyosuoritus = await getTyoSuoritusData(id);
  if (tyosuoritus[0] === undefined) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }
  const tuntihinnat = await getDataById<Tuntihinta>(
    id,
    'tyosuoritusTuntihinnat.sql'
  );
  const tarvikkeet = await getDataById<Tarvike>(
    id,
    'tyosuoritusTarvikkeet.sql'
  );

  result.tyosuoritus = tyosuoritus[0]?.tyosuoritus;
  result.asiakas = tyosuoritus[0]?.asiakas;
  result.tyokohde = tyosuoritus[0]?.tyokohde;
  result.laskut = await getDataById<Lasku>(id, 'tyosuoritusLaskut.sql');
  result.tuntihinnat = tuntihinnat;
  result.tarvikkeet = tarvikkeet;
  result.kokonaissumma = sumKokonaissumma(tyosuoritus, tuntihinnat, tarvikkeet);

  return result;
};

/**
 * Hakee tietokannasta kyselyn määrittelemät tiedot id:n perusteella
 * @param id tyosuorituksen id
 * @param queryFile kyselytiedoston nimi
 * @returns tietokannasta haetut rivit
 */
const getDataById = async <T extends QueryResultRow>(
  id: number,
  queryFile: string
): Promise<T[]> => {
  try {
    const queryStr = await getQueryFromFile(queryFile);
    const {rows} = await query<T>(queryStr, [id]);
    return rows;
  } catch (e) {
    throw new Error(
      `Virhe haettasessa työsuorituksen tietoja id:llä: ${id}\nkysely: ${queryFile}\nvirheilmoitus: ${e}`
    );
  }
};

const getTyoSuoritusData = async (id: number): Promise<Tyosuoritukset[]> => {
  const queryStr = await getQueryFromFile('tyosuoritus.sql');
  const {rows} = await query(queryStr, [id]);

  if (rows === undefined || rows.length === 0) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  const tyosuoritus = mapRowsToTyosuoritukset(rows);

  if (tyosuoritus[0] === undefined) {
    throw new Error('Tyosuorituksia ei löytynyt.');
  }

  return tyosuoritus;
};

/**
 * Laskee tuntihintojen ja tarvikkeiden yhteishinnan
 * @param tuntihinnat
 * @param tarvikkeet
 * @returns
 */
function sumKokonaissumma(
  tyosuoritus: Tyosuoritukset[],
  tuntihinnat: Tuntihinta[],
  tarvikkeet: Tarvike[]
): string {
  let kokonaissumma = new Decimal(0);
  if (tyosuoritus[0]?.urakka.hinta_yhteensa) {
    kokonaissumma = kokonaissumma.plus(
      new Decimal(tyosuoritus[0]?.urakka.hinta_yhteensa)
    );
  }

  for (const tuntihinta of tuntihinnat) {
    kokonaissumma = kokonaissumma.plus(new Decimal(tuntihinta.hinta_yhteensa));
  }
  for (const tarvike of tarvikkeet) {
    kokonaissumma = kokonaissumma.plus(new Decimal(tarvike.hinta_yhteensa));
  }

  return kokonaissumma.toFixed(2);
}

/**
 * Muuntaa tietokannasta tulleet rivit Tyosuoritukset-interfaceksi
 * TODO korvaa utils/parse.ts tyylin funktiolla
 * @param rows tietokannasta tulleet rivit
 * @returns Tyosuoritus-olioiden taulukko
 */
function mapRowsToTyosuoritukset(rows: QueryResultRow[]): Tyosuoritukset[] {
  const result: Tyosuoritukset[] = [];

  for (const row of rows) {
    const asiakas: Asiakas = {
      id: row['asiakas_id'],
      nimi: row['asiakas_nimi'],
      osoite: row['asiakas_osoite'],
      postinumero: row['asiakas_postinumero'],
      postitoimipaikka: row['asiakas_postitoimipaikka'],
      sahkoposti: row['asiakas_sahkoposti'],
      puhelinnumero: row['asiakas_puhelinnumero'],
    };

    const tyosuoritus: Tyosuoritus = {
      id: row['tyosuoritus_id'],
      tyokohde_id: row['tyokohde_id'],
      urakka_id: row['urakka_id'],
      aloitus_pvm: row['tyosuoritus_aloituspvm'],
      asiakas_id: row['tyosuoritus_asiakasid'],
      tila: row['tyosuoritus_tila'],
    };

    const tyokohde: Tyokohde = {
      id: row['tyokohde_id'],
      tyyppi: row['tyokohde_tyyppi'],
      osoite: row['tyokohde_osoite'],
      postinumero: row['tyokohde_postinumero'],
      postitoimipaikka: row['tyokohde_postitoimipaikka'],
    };

    const urakka: Urakka = {
      id: row['urakka_id'],
      lahtohinta: row['urakka_lahtohinta'],
      aleprosentti: row['urakka_aleprosentti'],
      alv_prosentti: row['urakka_alvprosentti'],
      korotusprosentti: row['urakka_korotusprosentti'],
      hinta: row['urakka_hinta'],
      hinta_yhteensa: row['urakka_hintayhteensa'],
      alv: row['urakka_alv'],
      kotitalousvahennys: row['urakka_kotitalousvahennys'],
    };

    result.push({
      tyosuoritus,
      asiakas,
      tyokohde,
      urakka,
    });
  }
  return result;
}

export {getTyosuoritukset, getTyosuoritus};
