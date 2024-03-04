import {Router} from 'express';
import Decimal from 'decimal.js';
import {
  getTyosuoritukset,
  getTyoSuoritusById,
  getDataById,
} from '../models/tyosuoritukset';
import {StatusCode} from '../constants/statusCodes';
import {Tuntihinta, Lasku, Tarvike, Tyosuoritukset} from '../models/interfaces';

const router = Router();

router.get('/uusi', (_req, res) => {
  res.render('tyosuoritukset/uusi');
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tyosuoritus = await getTyoSuoritusById(id);
    const laskut = await getDataById<Lasku>(id, 'tyosuoritusLaskut.sql');
    const tuntihinnat = await getDataById<Tuntihinta>(
      id,
      'tyosuoritusTuntihinnat.sql'
    );
    const tarvikkeet = await getDataById<Tarvike>(
      id,
      'tyosuoritusTarvikkeet.sql'
    );

    res.render('tyosuoritukset/tyosuoritus', {
      tyosuoritus: tyosuoritus[0]?.tyosuoritus,
      asiakas: tyosuoritus[0]?.asiakas,
      tyokohde: tyosuoritus[0]?.tyokohde,
      laskut,
      tuntihinnat,
      tarvikkeet,
      kokonaissumma: sumKokonaissumma(tyosuoritus, tuntihinnat, tarvikkeet),
    });
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.get('/', async (_req, res) => {
  try {
    const tyosuoritukset = await getTyosuoritukset();
    res.render('tyosuoritukset', {tyosuoritukset});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

/**
 * Laskee tuntihintojen ja tarvikkeiden yhteishinnan
 * @param tuntihinnat
 * @param tarvikkeet
 * @returns
 */
function sumKokonaissumma(
  tyosuoritus: Tyosuoritukset[],
  tuntihinnat: Tuntihinta[],
  tarvikkeet: Tarvike[]
): string {
  let kokonaissumma = new Decimal(0);
  if (tyosuoritus[0]?.urakka.hinta_yhteensa) {
    kokonaissumma = kokonaissumma.plus(
      new Decimal(tyosuoritus[0]?.urakka.hinta_yhteensa)
    );
  }

  for (const tuntihinta of tuntihinnat) {
    kokonaissumma = kokonaissumma.plus(new Decimal(tuntihinta.hinta_yhteensa));
  }
  for (const tarvike of tarvikkeet) {
    kokonaissumma = kokonaissumma.plus(new Decimal(tarvike.hinta_yhteensa));
  }

  return kokonaissumma.toFixed(2);
}

export default router;
