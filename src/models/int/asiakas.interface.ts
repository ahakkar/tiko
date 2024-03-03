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
