import {Router} from 'express';
import {DateTime} from 'luxon';
import {KokoLasku} from '../../../models/interfaces';
import {getKokoLasku} from '../../../models/laskuModel';
const router = Router();

/**
 * Näyttää modaalikkunan uuden laskun lisäämistä varten
 */
router.get('/:id/laskut', (req, res) => {
  const tyosuoritus_id = Number(req.params.id);

  // TODO hae max summa tietokannasta
  const max_summa = 9999999;

  res.render('tyosopimukset/id/laskut/uusiLasku', {
    max_summa,
    tyosuoritus_id,
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
