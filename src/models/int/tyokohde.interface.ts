import {QueryResultRow} from 'pg';

export interface Tyokohde extends QueryResultRow {
  id: number;
  tyyppi: string;
  osoite: string;
  postinumero: string;
  postitoimipaikka: string;
}
