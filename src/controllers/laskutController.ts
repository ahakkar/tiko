import {Router} from 'express';
import {getTyosopimusJaLasku} from '../models/tyosopimusModel';
import {getLaskuAsiakasKohde} from '../models/laskuModel';
import {LaskuAsiakasKohde} from '../models/interfaces';

const router = Router();

// TODO refaktoroi välittämään modelille vain laskun id, jolla se
// hakee ensin laskun, ja sitä kautta myös työsopimuksen tiedot
router.get('/', async (req, res) => {
  const laskuId = Number(req.query['laskuId']);
  const tyosopimusId = Number(req.query['tyosopimusId']);

  if (laskuId && tyosopimusId) {
    const tjl = await getTyosopimusJaLasku(tyosopimusId, laskuId);
    res.render('laskut/lasku', tjl);
    return;
  }
  // Render all invoices
  else {
    const laskut: LaskuAsiakasKohde[] = await getLaskuAsiakasKohde();
    res.render('laskut', {laskut: laskut});
  }
});

export default router;
