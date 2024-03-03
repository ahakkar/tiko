import {QueryResultRow} from 'pg';

export interface Toimittaja extends QueryResultRow {
  id: number;
  nimi: string;
  osoite: string;
}
