import {QueryResultRow} from 'pg';

export interface Tarvike extends QueryResultRow {
  id: number;
  varastotarvike_id: number;
  tyosuoritus_id: number;
  maara: number;
  hinta_ulos: number;
  pvm: Date;
  aleprosentti: number;
  alv_prosentti: number;
  hinta: number;
  alv: number;
}
