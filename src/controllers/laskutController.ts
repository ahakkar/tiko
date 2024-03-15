import {Router} from 'express';
import {getTyosopimusJaLasku} from '../models/tyosopimusModel';

const router = Router();

router.get('/', async (req, res) => {
  const laskuId = Number(req.query['laskuId']);
  const tyosopimusId = Number(req.query['tyosopimusId']);

  if (laskuId && tyosopimusId) {
    const tjl = await getTyosopimusJaLasku(tyosopimusId, laskuId);
    console.log(tjl);
    res.render('laskut/lasku', tjl);
    return;
  }
  // Render all invoices
  else {
    res.render('laskut');
  }
});

export default router;
