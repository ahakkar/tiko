import {Router} from 'express';
import {
  getTyosopimus,
  getTyosopimukset,
  validoiTyosopimus,
  lisaaTyosopimus,
  luoUrakka,
} from '../../models/tyosopimusModel';
import tyot from './id/tyoController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
import {Tyosuoritus} from '../../models/interfaces';
import {StatusCode} from '../../constants/statusCode';
import {ContractState} from '../../constants/contractState';

const router = Router();
router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

router.get('/uusiTyosopimus', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosopimukset/uusiTyosopimus', {tyokohteet, asiakkaat});
});

router.get('/tyokohde/uusiTyokohde', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosopimus(id);
  res.render('tyosopimukset/id', koko);
});

router.get('/', async (_req, res) => {
  const tyosopimukset = await getTyosopimukset();
  res.render('tyosopimukset', {tyosopimukset});
});

router.post('/', async (req, res) => {
  const ts: Tyosuoritus = {
    id: -1, // id generoidaan tietokannassa
    urakka_id: -1, // id generoidaan tietokannassa
    tyokohde_id: req.body.tyokohde_id,
    asiakas_id: req.body.asiakas_id,
    aloitus_pvm: new Date(),
    tila: ContractState.InDesign,
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
