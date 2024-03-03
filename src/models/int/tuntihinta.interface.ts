import {QueryResultRow} from 'pg';
export interface Tuntihinta extends QueryResultRow {
  tuntihinta_id: number;
  tyosuoritus_id: number;
  tuntihintatyyppi_id: number;
  pvm: Date;
  alv_prosentti: string;
  aleprosentti: string;
  tunnit: number;
  tyyppi: string;
  tuntihinta: string;
  hinta: string;
  alv: string;
  hinta_yhteensa: string;
}
