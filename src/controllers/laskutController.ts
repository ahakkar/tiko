import {Router} from 'express';
import {getTyosopimusJaLasku} from '../models/tyosopimusModel';
import {addMuistutusLasku, getLaskuAsiakasKohde} from '../models/laskuModel';
import {LaskuAsiakasKohde} from '../models/interfaces';
import {StatusCode} from '../constants';
import {lisaaLasku, validoiLasku} from '../models/laskuModel';
import {Lasku} from '../models/interfaces';

const router = Router();

/**
 * Tallentaa työsopimukseen {id} viittaavan laskun
 * tietokantaan
 */
router.post('/', async (req, res) => {
  if (!res.locals['writeAccess']) {
    res.sendStatus(StatusCode.Unauthorized);
    return;
  }

  // Jos laskulla on edellinen lasku, se on muistutuslasku.
  if (req.body.edellinen_lasku) {
    await addMuistutusLasku(req.body.era_pvm, req.body.edellinen_lasku);
  } else {
    const l: Lasku = {
      tyosuoritus_id: Number(req.body.tyosuoritus_id),
      summa: Number(req.body.summa),
      pvm: new Date(),
      era_pvm: new Date(req.body.era_pvm),
    };
    console.log('tallennetaan lasku', req.body);

    if (!validoiLasku(l)) {
      res.sendStatus(StatusCode.BadRequest);
      return;
    }

    if (!(await lisaaLasku(l))) {
      res.sendStatus(StatusCode.InternalServerError);
      return;
    }
  }

  res.set('hx-refresh', 'true');
  res.sendStatus(StatusCode.OK);
});

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
