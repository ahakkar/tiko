import {Router} from 'express';
import {
  getTyosuoritus,
  getTyosuoritukset,
  validoiTyosuoritus,
  lisaaTyosuoritus,
  luoUrakka,
} from '../../models/tyosuoritusModel';
import tyot from './id/tyoController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
import {Tyosuoritus} from '../../models/interfaces';
import {StatusCode} from '../../constants/statusCode';
import {ContractState} from '../../constants/contractState';

const router = Router();

router.get('/uusiTyosuoritus', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosuoritukset/uusiTyosuoritus', {tyokohteet, asiakkaat});
});

router.get('/tyokohde/uusiTyokohde', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
});

router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosuoritus(id);
  res.render('tyosuoritukset/id', koko);
});

router.get('/', async (_req, res) => {
  const tyosuoritukset = await getTyosuoritukset();
  res.render('tyosuoritukset', {tyosuoritukset});
});

router.post('/', async (req, res) => {
  console.log('Lisätään uusi työsuoritus');
  const ts: Tyosuoritus = {
    id: -1, // id generoidaan tietokannassa
    urakka_id: -1, // id generoidaan tietokannassa
    tyokohde_id: req.body.tyokohde_id,
    asiakas_id: req.body.asiakas_id,
    aloitus_pvm: new Date(),
    tila: ContractState.InDesign,
  };

  if (!validoiTyosuoritus(ts)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  if (req.body.tyyppi === 'urakka') {
    const uusiUrakka = await luoUrakka();
    ts.urakka_id = uusiUrakka.id;
  }

  const result = await lisaaTyosuoritus(ts);
  if (result) {
    res.set('hx-redirect', `/tyosuoritukset/${result.id}`);
    res.sendStatus(StatusCode.Created);
    return;
  }

  // TODO tässä tapauksessa pitäisi yllä luotu urakka myös poistaa...
  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
