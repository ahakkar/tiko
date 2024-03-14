import {Router} from 'express';
const router = Router();

router.post('/', (_req, res) => {
  res.clearCookie('login').set('hx-refresh', 'true').status(200).send();
});

export default router;
