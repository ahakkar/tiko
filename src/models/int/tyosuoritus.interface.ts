import {QueryResultRow} from 'pg';

export interface Tyosuoritus extends QueryResultRow {
  id: number;
  tyokohde_id: number;
  urakka_id: number;
  aloitus_pvm: Date;
  asiakas_id: number;
  tila: string;
}
