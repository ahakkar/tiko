import {Router} from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.send('<div>Hello World!</div>');
});

router.post('/', (_req, res) => {
  res.send('<div>Työkohde on lisätty asiakkaalle.</div>');
});

export default router;
