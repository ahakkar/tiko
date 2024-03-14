import {Router} from 'express';
import {
  getAsiakkaat,
  lisaaAsiakas,
  validoiAsiakas,
} from '../models/asiakasModel';
import {Asiakas} from '../models/interfaces';
import {StatusCode} from '../constants/statusCode';
const router = Router();

router.get('/', async (_req, res) => {
  const asiakkaat = await getAsiakkaat();
  res.render('asiakkaat', {asiakkaat});
});

router.get('/uusiAsiakas', (_req, res) => {
  res.render('asiakkaat/uusiAsiakas', {
    layout: 'modal',
  });
});

router.post('/', async (req, res) => {
  console.log('Lisätään uusi asiakas');
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
