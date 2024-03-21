import {Router} from 'express';
import {
  lisaaTyokohde,
  validoiTyokohde,
  getTyokohteet,
} from '../models/tyokohdeModel';
import {Tyokohde} from '../models/interfaces';
import {StatusCode, WORKSITES} from '../constants';
const router = Router();

router.get('/', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  res.render('tyokohteet', {tyokohteet});
});

router.get('/uusi', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
    worksites: WORKSITES,
  });
});

router.post('/', async (req, res) => {
  const t: Tyokohde = {
    id: -1, // id generoidaan tietokannassa
    tyyppi: req.body.tyyppi,
    osoite: req.body.osoite,
    postinumero: req.body.postinumero,
    postitoimipaikka: req.body.postitoimipaikka,
  };

  if (!validoiTyokohde(t)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  if (await lisaaTyokohde(t)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
