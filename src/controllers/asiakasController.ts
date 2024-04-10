import {Router} from 'express';
import {
  getAsiakkaat,
  lisaaAsiakas,
  validoiAsiakas,
} from '../models/asiakasModel';
import {Asiakas} from '../models/interfaces';
import {StatusCode} from '../constants';
import {getDataById} from '../models/dbModel';
import {hasMuistutusLasku} from '../models/laskuModel';
const router = Router();

router.get('/', async (_req, res) => {
  const asiakkaat = await getAsiakkaat();
  res.render('asiakkaat/asiakkaat', {asiakkaat});
});

router.get('/uusi', (_req, res) => {
  res.render('asiakkaat/uusiAsiakas', {
    layout: 'modal',
  });
});

router.get('/:id', async (_req, res) => {
  const aid = parseInt(_req.params.id);
  const asiakas = await getDataById(aid, 'asiakas.sql');
  const tyosopimukset = await getDataById(aid, 'asiakkaanTyosopimukset.sql');
  const muokaamattomatLaskut = await getDataById(aid, 'asiakkaanLaskut.sql');
  const laskut = [];

  for (const lasku of muokaamattomatLaskut) {
    const expired =
      lasku['era_pvm'] < new Date() && lasku['maksettu_pvm'] === null;
    const hasReminder = await hasMuistutusLasku(lasku['id']);
    laskut.push({
      ...lasku,
      expired,
      showExpiredButton: !hasReminder && expired,
      sopimusMaksettu: lasku['maksettu_pvm'] !== null,
    });
  }

  res.render('asiakkaat/asiakas', {asiakas: asiakas[0], tyosopimukset, laskut});
});
router.post('/', async (req, res) => {
  const a: Asiakas = {
    id: -1, // id generoidaan tietokannassa
    nimi: req.body.nimi,
    osoite: req.body.osoite,
    postinumero: req.body.postinumero,
    postitoimipaikka: req.body.postitoimipaikka,
    sahkoposti: req.body.sahkoposti,
    puhelinnumero: req.body.puhelinnumero,
  };

  if (!validoiAsiakas(a)) {
    res.sendStatus(400);
    return;
  }

  if (await lisaaAsiakas(a)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
