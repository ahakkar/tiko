import {Router} from 'express';
import {getTyosuoritus, getTyosuoritukset} from '../models/tyosuoritukset';

const router = Router();

router.get('/uusi', (_req, res) => {
  res.render('tyosuoritukset/uusi');
});

router.get('/:id/laskut/uusi', (_req, res) => {
  res.render('tyosuoritukset/id/laskut/uusi', {layout: 'modal'});
});

router.get('/:id/tyot/uusi', (_req, res) => {
  res.render('tyosuoritukset/id/tyot/uusi', {layout: 'modal'});
});

router.get('/:id/tarvikkeet/uusi', (_req, res) => {
  res.render('tyosuoritukset/id/tarvikkeet/uusi', {layout: 'modal'});
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosuoritus(id);
  res.render('tyosuoritukset/id', koko);
});

router.get('/', async (_req, res) => {
  const tyosuoritukset = await getTyosuoritukset();
  res.render('tyosuoritukset', {tyosuoritukset});
});

router.post('/', (req, res) => {
  console.log(req.body);
  // TODO: Tallenna tietokantaan
  const id = 1; // TODO: Korvaa luodun työsuorituksen id:llä
  res.set('hx-redirect', `/tyosuoritukset/${id}`);
  res.sendStatus(201);
});

export default router;
