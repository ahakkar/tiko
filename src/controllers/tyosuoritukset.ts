import {Router} from 'express';
import {
  getTyosuoritukset,
  getTyoSuoritusById,
  getDataById,
} from '../models/tyosuoritukset';
import {StatusCode} from '../constants/statusCodes';
const router = Router();

router.get('/form', (_req, res) => {
  res.render('tyosuoritukset/form');
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tyosuoritus = await getTyoSuoritusById(id);
    const laskut = await getDataById(id, 'tyosuoritusLaskut.sql');
    const tuntihinnat = await getDataById(id, 'tyosuoritusTuntihinnat.sql');
    const tarvikkeet = await getDataById(id, 'tyosuoritusTarvikkeet.sql');

    res.render('tyosuoritukset/tyosuoritus', {
      tyosuoritus: tyosuoritus[0]?.tyosuoritus,
      asiakas: tyosuoritus[0]?.asiakas,
      tyokohde: tyosuoritus[0]?.tyokohde,
      laskut,
      tuntihinnat,
      tarvikkeet,
      kokonaissumma: 666, // TODO laske kokonaissumma
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

export default router;
