import {Router} from 'express';
import {getTyosuoritus, getTyosuoritukset} from '../models/tyosuoritukset';
import {StatusCode} from '../constants/statusCodes';
import {KokoTyosuoritus} from '../models/interfaces';

const router = Router();

router.get('/uusi', (_req, res) => {
  res.render('tyosuoritukset/uusi');
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko: KokoTyosuoritus = await getTyosuoritus(id);
  res.render('tyosuoritukset/tyosuoritus', {koko});
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
