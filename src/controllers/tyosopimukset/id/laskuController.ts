import {Router} from 'express';
import {DateTime} from 'luxon';
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
router.get('/:id/laskut/:laskuid/muistutuslaskut', (req, res) => {
  const tyosuoritus_id = Number(req.params.id);
  const edellinen_lasku = Number(req.params.laskuid);

  // TODO: Hae laskutiedot tietokannasta
  const db = {
    old_summa: 100,
    muistutusmaksu: 10,
    viivastyskorko: 7, // Tää on 0, jos on muistutuslasku
    total: 100 + 10 + 7,
  };
  res.render('tyosopimukset/id/laskut/uusiMuistutuslasku', {
    ...db,
    edellinen_lasku,
    tyosuoritus_id,
    today: DateTime.now().toFormat('yyyy-MM-dd'),
    default_era_pvm: DateTime.now().plus({days: 14}).toFormat('yyyy-MM-dd'),
    layout: 'modal',
  });
});

export default router;
