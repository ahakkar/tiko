import {Router} from 'express';
import {addMuistutusLasku} from '../models/laskuModel';
import {StatusCode} from '../constants';
import {lisaaLasku, validoiLasku} from '../models/laskuModel';
import {Lasku} from '../models/interfaces';

const router = Router();

/**
 * Tallentaa työsopimukseen {id} viittaavan laskun
 * tietokantaan
 */
router.post('/', async (req, res) => {
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
router.get('/', async (_req, res) => {
  /*   const laskuId = Number(req.query['laskuId']);
  const tyosopimusId = Number(req.query['tyosopimusId']); */

  res.sendStatus(StatusCode.OK);

  /*   if (laskuId && tyosopimusId) {
    const tjl: TyosopimusJaLasku = await getTyosopimusJaLasku(
      tyosopimusId,
      laskuId
    );
    res.render('laskut/lasku', tjl);
    return;
  }
  // Render all invoices
  else {
    const laskut: LaskuAsiakasKohde[] = await getLaskuAsiakasKohde();
    res.render('laskut', {laskut: laskut});
  } */
});

export default router;
