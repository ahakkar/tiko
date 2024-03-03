import {QueryResultRow} from 'pg';
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
