import {query} from './dbModel';
import {Tuntihintatyyppi} from './interfaces';

/**
 * Hakee tietokannasta tuntihinnat
 * @returns tuntihinnat
 */
export const getTuntihintatyypit = async (): Promise<Tuntihintatyyppi[]> => {
  const {rows} = await query<Tuntihintatyyppi>(
    'SELECT * FROM tuntihintatyyppi'
  );

  return rows;
};
