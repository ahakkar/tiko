import {Router} from 'express';
import {DateTime} from 'luxon';
import {StatusCode} from '../../../constants/statusCode';
import {lisaaLasku, validoiLasku} from '../../../models/laskuModel';
import {Lasku} from '../../../models/interfaces';
const router = Router();

/**
 * Näyttää modaalikkunan uuden laskun lisäämistä varten
 */
router.get('/:id/laskut/uusi', (req, res) => {
  const id = Number(req.params.id);

  // TODO hae max summa tietokannasta
  const max_summa = 9999999;

  res.render('tyosopimukset/id/laskut/uusiLasku', {
    max_summa,
    id,
    today: DateTime.now().toFormat('yyyy-MM-dd'),
    default_era_pvm: DateTime.now().plus({days: 14}).toFormat('yyyy-MM-dd'),
    layout: 'modal',
  });
});

/**
 * Tallentaa työsopimukseen {id} viittaavan laskun
 * tietokantaan
 */
router.post('/:id/laskut', async (_req, res) => {
  console.log('tallennetaan lasku');
  const l: Lasku = {
    tyosuoritus_id: Number(_req.params.id),
    summa: Number(_req.body.summa),
    pvm: new Date(),
    era_pvm: new Date(_req.body.era_pvm),
  };

  if (!validoiLasku(l)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  if (await lisaaLasku(l)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
