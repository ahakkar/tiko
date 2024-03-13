import {Router} from 'express';
import {
  lisaaTyokohde,
  validoiTyokohde,
  getTyokohteet,
} from '../models/tyokohteet';
import {Tyokohde} from '../models/interfaces';
import {StatusCode} from '../constants/statusCodes';
const router = Router();

router.get('/', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  res.render('tyokohteet', {tyokohteet});
});

router.get('/uusi', (_req, res) => {
  res.render('tyokohteet/uusi', {
    layout: 'modal',
  });
});

router.post('/', async (req, res) => {
  console.log('Lisätään uusi työkohde');
  const a: Tyokohde = {
    id: -1, // id generoidaan tietokannassa
    tyyppi: req.body.tyyppi,
    osoite: req.body.osoite,
    postinumero: req.body.postinumero,
    postitoimipaikka: req.body.postitoimipaikka,
  };

  if (!validoiTyokohde(a)) {
    res.sendStatus(400);
    return;
  }

  if (await lisaaTyokohde(a)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
