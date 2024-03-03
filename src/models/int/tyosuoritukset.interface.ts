import {Asiakas} from './asiakas.interface';
import {Tyokohde} from './tyokohde.interface';
import {Tyosuoritus} from './tyosuoritus.interface';

export interface Tyosuoritukset {
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  tyosuoritus: Tyosuoritus;
}
