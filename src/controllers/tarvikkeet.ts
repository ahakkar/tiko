import {Router} from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.render('tarvikkeet');
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

export default router;
