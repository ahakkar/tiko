import {Router} from 'express';
import {DateTime} from 'luxon';
import {KokoLasku} from '../../../models/interfaces';
import {getKokoLasku} from '../../../models/laskuModel';
import {getTyosopimusJaLaskut} from '../../../models/tyosopimusModel';
const router = Router();

/**
 * Näyttää modaalikkunan uuden laskun lisäämistä varten
 */
router.get('/:id/laskut', async (req, res) => {
  const tyosopimus_id = Number(req.params.id);

  // TODO jos max summaa haluttaisiin rajata, tähän pitäisi
  // tarkistaa myös montako laskua on luotu tätä ennen
  // onko karhulaskuja
  // viivästyskorko yms
  const tjl = await getTyosopimusJaLaskut(tyosopimus_id);
  const max_summa = tjl.kokonaissumma;

  res.render('tyosopimukset/id/laskut/uusiLasku', {
    max_summa,
    tyosopimus_id,
    today: DateTime.now().toFormat('yyyy-MM-dd'),
    default_era_pvm: DateTime.now().plus({days: 14}).toFormat('yyyy-MM-dd'),
    layout: 'modal',
  });
});

/**
 * Näyttää modaalikkunan uuden muistutuslaskun lisäämistä varten
 */
router.get('/:id/laskut/:laskuid/muistutuslaskut', async (req, res) => {
  const edellinenId = Number(req.params.laskuid);
  const edellinen_lasku: KokoLasku = await getKokoLasku(edellinenId);

  res.render('tyosopimukset/id/laskut/uusiMuistutuslasku', {
    edellinen_lasku,
    today: DateTime.now().toFormat('yyyy-MM-dd'),
    default_era_pvm: DateTime.now().plus({days: 14}).toFormat('yyyy-MM-dd'),
    layout: 'modal',
  });
});

export default router;
