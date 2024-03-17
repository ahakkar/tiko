import {Router} from 'express';
import {
  getTyosopimusJaLaskut,
  getTyosopimukset,
  validoiTyosopimus,
  lisaaTyosopimus,
  luoUrakka,
} from '../../models/tyosopimusModel';
import tyot from './id/tyosuoritusController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
import {Tyosopimus} from '../../models/interfaces';
import {CONTRACT_STATES, StatusCode} from '../../constants';

const router = Router();
router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

router.get('/uusi', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosopimukset/uusiTyosopimus', {tyokohteet, asiakkaat});
});

router.get('/tyokohde/uusi', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const tjl = await getTyosopimusJaLaskut(id);
  const tyosopimus = {
    ...tjl,
    laskut: tjl.laskut.map(lasku => ({
      ...lasku,
      // TODO: Lisää expired-muuttuja laskuille backendiin, joka
      // kertoo, onko lasku erääntynyt
      expired: lasku.era_pvm < new Date(),
      // TODO: Laita arvoksi true, jos lasku on erääntynyt ja siitä ei
      // ole vielä luotu muistutuslaskua
      showExpiredButton: true,
    })),
  };
  res.render('tyosopimukset/id', tyosopimus);
});

router.get('/', async (_req, res) => {
  const tyosopimukset = await getTyosopimukset();
  res.render('tyosopimukset', {tyosopimukset});
});

router.post('/', async (req, res) => {
  const ts: Tyosopimus = {
    id: -1, // id generoidaan tietokannassa
    urakka_id: -1, // id generoidaan tietokannassa
    tyokohde_id: req.body.tyokohde_id,
    asiakas_id: req.body.asiakas_id,
    aloitus_pvm: new Date(),
    tila: CONTRACT_STATES[0]!,
  };

  if (!validoiTyosopimus(ts)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  if (req.body.tyyppi === 'urakka') {
    const uusiUrakka = await luoUrakka();
    ts.urakka_id = uusiUrakka.id;
  }

  const result = await lisaaTyosopimus(ts);
  if (result) {
    res.set('hx-redirect', `/tyosopimukset/${result.id}`);
    res.sendStatus(StatusCode.Created);
    return;
  }

  // TODO tässä tapauksessa pitäisi yllä luotu urakka myös poistaa...
  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
