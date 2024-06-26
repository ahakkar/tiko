import {QueryResultRow} from 'pg';

export interface AlvErittely extends QueryResultRow {
  alv_prosentti: string;
  hinta_summa: string;
  alv_summa: string;
}

export interface Asiakas extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
  sahkoposti: string | null;
  puhelinnumero: string | null;
}

export interface Erittely extends QueryResultRow {
  alv0_summa: string;
  summa: string;
  alv: string;
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
  era_pvm: Date;
  pvm: Date;
  maksettu_pvm: Date;
  jarjestysluku: number;
  laskutuslisä: number;
  viivastyskorko: number;
  tarvikkeet_summa: string;
  tarvikkeet_alkup_hinta: string;
  tarvikkeet_alv0_summa: string;
  tarvikkeet_alv: string;
  tyo_summa: string;
  tyo_alkup_hinta: string;
  tyo_alv0_summa: string;
  tyo_alv: string;
  kotitalousvahennys: string;
  kokonaissumma_alvilla: string;
  kokonaissumma_alv0: string;
  alesumma_alv0: string;
  aleprosentti: string;
  alv_erittely: AlvErittely[];
}

export interface KokoTyosopimus {
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  tyosopimus: Tyosopimus;
  urakka: Urakka | undefined;
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
  hinta: string | null;
  alv: string | null;
  hinta_yhteensa: number | null;
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

export interface Summat extends QueryResultRow {
  lahtohinta: string;
  alehinta: string;
  alv_hinta: string;
}

export interface Tarvike extends QueryResultRow {
  id: number;
  nimi: string;
  tyosuoritus_id: number;
  varastotarvike_id: number;
  yksikko: string;
  maara: number;
  hinta_sisaan: string;
  hinta_ulos: string;
  hinta_yhteensa: string;
  pvm: Date;
  aleprosentti: string;
  alv_prosentti: string;
  hinta: string;
  alv: string;
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
