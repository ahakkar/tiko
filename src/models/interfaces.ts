import {QueryResultRow} from 'pg';

export interface Asiakas extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
  sahkoposti: string | null;
  puhelinnumero: string | null;
}

export interface Kayttaja {
  nimi: string;
  salasanatiiviste: string;
  rooli: 'read' | 'write';
}

export interface KokoLasku extends QueryResultRow {
  id: number;
  tyosuoritus_id: number;
  summa: number;
  yhteissumma: number;
  era_pvm: Date; // puuttuu
  pvm: Date; // puuttuu
  maksettu_pvm: Date; // puuttuu
  jarjestysluku: number;
  laskutuslisä: number;
  viivastyskorko: number;
  tarvike_hinta: number;
  tarvike_alv: number;
  tyo_hinta: number;
  tyo_alv: number;
  kotitalousvahennys: number;
  kokonaissumma: number;
}

export interface KokoTyosopimus {
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  tyosopimus: Tyosopimus;
  urakka: Urakka;
}

export interface KokoTyosuoritus extends QueryResultRow {
  tuntihinta_id: number;
  tyosuoritus_id: number;
  tuntihintatyyppi_id: number;
  pvm: Date;
  alv_prosentti: number;
  aleprosentti: number;
  tunnit: number;
  tyyppi: string;
  tuntihinta: string;
  hinta: string;
  alv: string;
  hinta_yhteensa: string;
}

export interface Lasku extends QueryResultRow {
  id?: number;
  edellinen_lasku?: number;
  tyosuoritus_id: number;
  summa: number;
  pvm: Date;
  era_pvm: Date;
  maksettu_pvm?: Date;
  jarjestysluku?: number;
}

export interface LaskuAsiakasKohde extends QueryResultRow {
  id: number;
  tyosuoritus_id: number;
  asiakas_nimi: string;
  tyokohde_osoite: string;
  tyokohde_postitoimipaikka: string;
  pvm: Date;
  era_pvm: Date;
  summa: number;
  is_maksettu: boolean;
}

export interface NewWarehouseItems {
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

export interface Tarvike extends QueryResultRow {
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

export interface Toimittaja extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
}

export interface Tuntihintatyyppi extends QueryResultRow {
  id: number;
  tyyppi: string;
  hinta: number;
}

export interface Tyokohde extends QueryResultRow {
  id: number;
  tyyppi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
}
export interface Tyosuoritus extends QueryResultRow {
  tuntihinta_id: number;
  tyosuoritus_id: number;
  tuntihintatyyppi_id: number;
  pvm: Date;
  alv_prosentti: number;
  aleprosentti: number;
  tunnit: number;
}

export interface Tyosopimus extends QueryResultRow {
  id: number | null;
  tyokohde_id: number;
  urakka_id: number | null;
  aloitus_pvm: Date;
  asiakas_id: number;
  tila: string;
}

export interface TyosopimusJaLasku {
  tyosopimus: Tyosopimus;
  urakka: Urakka | null;
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  lasku: KokoLasku | undefined;
  tyosuoritukset: Tyosuoritus[];
  tarvikkeet: Tarvike[];
  kokonaissumma: string;
  is_urakka: boolean;
  is_tuntihinta: boolean;
}

export interface TyosopimusJaLaskut {
  tyosopimus: Tyosopimus;
  urakka: Urakka | null;
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  laskut: KokoLasku[];
  tyosuoritukset: Tyosuoritus[];
  tarvikkeet: Tarvike[];
  kokonaissumma: string;
  is_urakka: boolean;
  is_tuntihinta: boolean;
}

export interface Urakka extends QueryResultRow {
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

export interface VarastoTarvike extends QueryResultRow {
  id: number;
  toimittaja_nimi?: string;
  toimittaja_id: number;
  nimi: string;
  merkki: string;
  tyyppi: string;
  varastotilanne: number;
  yksikko: string;
  hinta_sisaan: number;
  vanhentunut: boolean;
}
