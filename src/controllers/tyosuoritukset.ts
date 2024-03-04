import {Router} from 'express';
import {getTyosuoritus, getTyosuoritukset} from '../models/tyosuoritukset';

const router = Router();

router.get('/uusi', (_req, res) => {
  res.render('tyosuoritukset/uusi');
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosuoritus(id);
  res.render('tyosuoritukset/tyosuoritus', koko);
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
  res.sendStatus(200);
});

export default router;
