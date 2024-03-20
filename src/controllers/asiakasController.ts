import {Router} from 'express';
import {
  getAsiakkaat,
  lisaaAsiakas,
  validoiAsiakas,
} from '../models/asiakasModel';
import {Asiakas} from '../models/interfaces';
import {StatusCode} from '../constants';
const router = Router();

router.get('/', async (_req, res) => {
  const asiakkaat = await getAsiakkaat();
  res.render('asiakkaat', {asiakkaat});
});

router.get('/uusi', (_req, res) => {
  res.render('asiakkaat/uusiAsiakas', {
    layout: 'modal',
  });
});

router.post('/', async (req, res) => {
  if (!res.locals['writeAccess']) {
    res.sendStatus(StatusCode.Unauthorized);
    return;
  }

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
