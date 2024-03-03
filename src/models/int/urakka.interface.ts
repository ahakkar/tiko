import {QueryResultRow} from 'pg';
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
