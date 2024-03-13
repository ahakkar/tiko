import {Router} from 'express';
import {getTyosuoritus, getTyosuoritukset} from '../../models/tyosuoritusModel';
import tyot from './id/tyoController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
const router = Router();

router.get('/uusiTyosuoritus', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosuoritukset/uusiTyosuoritus', {tyokohteet, asiakkaat});
});

router.get('/tyokohde/uusiTyokohde', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
});

router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosuoritus(id);
  res.render('tyosuoritukset/id', koko);
});

router.get('/', async (_req, res) => {
  const tyosuoritukset = await getTyosuoritukset();
  res.render('tyosuoritukset', {tyosuoritukset});
});

router.post('/', (_req, res) => {
  // TODO: Tallenna tietokantaan
  // console.log(req.body);
  const id = 1; // TODO: Korvaa luodun työsuorituksen id:llä
  res.set('hx-redirect', `/tyosuoritukset/${id}`);
  res.sendStatus(201);
});

export default router;
