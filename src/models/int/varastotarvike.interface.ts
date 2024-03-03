import {QueryResultRow} from 'pg';

export interface VarastoTarvike extends QueryResultRow {
  id: number;
  toimittaja_id: number;
  nimi: string;
  merkki: string;
  tyyppi: string;
  varastotilanne: number;
  yksikko: string;
  hinta_sisaan: number;
}
