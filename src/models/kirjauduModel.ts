import {query} from './dbModel';
import {Kayttaja} from './interfaces';

export const getKayttaja = async (nimi: string): Promise<Kayttaja | null> => {
  const result = await query<Kayttaja>(
    'SELECT * FROM kayttajat WHERE nimi = $1',
    [nimi]
  );
  if (result.rowCount !== 1) {
    return null;
  }
  const kayttaja = result.rows[0]!;
  return kayttaja;
};
