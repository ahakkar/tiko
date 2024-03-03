import {Router} from 'express';
import {
  getTyosuoritukset,
  getTyoSuoritusById,
  getDataById,
} from '../models/tyosuoritukset';
import {StatusCode} from '../constants/statusCodes';
import {Tuntihinta} from '../models/int/tuntihinta.interface';
import {Lasku} from '../models/int/lasku.interface';
import {Tarvike} from '../models/int/tarvike.interface';
import Decimal from 'decimal.js';
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
      kokonaissumma: sumKokonaissumma(tuntihinnat, tarvikkeet),
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
function sumKokonaissumma(tuntihinnat: Tuntihinta[], tarvikkeet: Tarvike[]) {
  let kokonaissumma = new Decimal(0);

  for (const tuntihinta of tuntihinnat) {
    console.log(tuntihinta.hinta_yhteensa);
    kokonaissumma = kokonaissumma.plus(new Decimal(tuntihinta.hinta_yhteensa));
  }
  for (const tarvike of tarvikkeet) {
    console.log(tarvike.hinta_yhteensa);
    kokonaissumma = kokonaissumma.plus(new Decimal(tarvike.hinta_yhteensa));
  }

  return kokonaissumma.toFixed(2);
}

export default router;
