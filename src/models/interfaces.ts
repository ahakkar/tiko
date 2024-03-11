import {QueryResultRow} from 'pg';

interface Asiakas extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
  sahkoposti: string | null;
  puhelinnumero: string | null;
}

interface KokoTyosuoritus {
  tyosuoritus: Tyosuoritus;
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  laskut: Lasku[];
  tuntihinnat: Tuntihinta[];
  tarvikkeet: Tarvike[];
  kokonaissumma: string;
}

interface Lasku extends QueryResultRow {
  id: number;
  edellinen_lasku: number;
  tyosuoritus_id: number;
  summa: number;
  pvm: Date;
  era_pvm: Date;
  maksettu_pvm: Date;
  jarjestysluku: number;
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

interface Tarvike extends QueryResultRow {
  id: number;
  nimi: string;
  tyosuoritus_id: number;
  varastotarvike_id: number;
  maara: number;
  hinta_sisaan: number;
  hinta_ulos: number;
  hinta_yhteensa: number;
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

interface Tuntihinta extends QueryResultRow {
  tuntihinta_id: number;
  tyosuoritus_id: number;
  tuntihintatyyppi_id: number;
  pvm: Date;
  alv_prosentti: string;
  aleprosentti: string;
  tunnit: number;
  tyyppi: string;
  tuntihinta: string;
  hinta: string;
  alv: string;
  hinta_yhteensa: string;
}

interface Tyokohde extends QueryResultRow {
  id: number;
  tyyppi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
}

interface Tyosuoritukset {
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  tyosuoritus: Tyosuoritus;
  urakka: Urakka;
}

interface Tyosuoritus extends QueryResultRow {
  id: number;
  tyokohde_id: number;
  urakka_id: number;
  aloitus_pvm: Date;
  asiakas_id: number;
  tila: string;
}

interface Urakka extends QueryResultRow {
  id: number;
  lahtohinta: number;
  aleprosentti: number;
  alv_prosentti: number;
  korotusprosentti: number;
  hinta: number;
  hinta_yhteensa: number;
  alv: number;
  kotitalousvahennys: number;
}

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

interface Kayttaja {
  nimi: string;
  salasanatiiviste: string;
}

export {
  Asiakas,
  KokoTyosuoritus,
  Lasku,
  NewWarehouseItems,
  Tarvike,
  Toimittaja,
  Tuntihinta,
  Tyokohde,
  Tyosuoritukset,
  Tyosuoritus,
  Urakka,
  VarastoTarvike,
  Kayttaja,
};
