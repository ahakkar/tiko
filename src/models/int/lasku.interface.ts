import {QueryResultRow} from 'pg';

export interface Lasku extends QueryResultRow {
  id: number;
  edellinen_lasku: number;
  tyosuoritus_id: number;
  summa: number;
  pvm: Date;
  era_pvm: Date;
  maksettu_pvm: Date;
  jarjestysluku: number;
}
