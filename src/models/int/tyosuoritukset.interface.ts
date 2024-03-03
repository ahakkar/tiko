import {Asiakas} from './asiakas.interface';
import {Tyokohde} from './tyokohde.interface';
import {Tyosuoritus} from './tyosuoritus.interface';
import {Urakka} from './urakka.interface';

export interface Tyosuoritukset {
  asiakas: Asiakas;
  tyokohde: Tyokohde;
  tyosuoritus: Tyosuoritus;
  urakka: Urakka;
}
