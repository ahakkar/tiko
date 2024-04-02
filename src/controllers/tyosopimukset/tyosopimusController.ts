import {Router} from 'express';
import {
  validoiTyosopimus,
  lisaaTyosopimus,
  luoUrakka,
  updateTyosopimusState,
  haeKokoTyosopimus,
  haeTyosopimukset,
  paivitaUrakkaHinta,
  laskeSopimusHinta,
} from '../../models/tyosopimusModel';
import tyot from './id/tyosuoritusController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
import {Tyosopimus} from '../../models/interfaces';
import {ContractState, StatusCode} from '../../constants';
import {haeTarvikkeet} from '../../models/tarvikeModel';
import {haeTyosuoritukset} from '../../models/tyosuoritusModel';
import {haeKokoLaskut, hasMuistutusLasku} from '../../models/laskuModel';

const router = Router();
router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

// Kaikki työsopimukset -sivu
router.get('/', async (_req, res) => {
  const tyosopimukset = await haeTyosopimukset();
  //console.log(tyosopimukset);
  res.render('tyosopimukset', {tyosopimukset});
});

// Yhden työsopimuksen sivu
router.get('/:id', async (req, res) => {
  const työsopimus_id = Number(req.params.id);

  if (isNaN(työsopimus_id)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  const tyosopimus = await haeKokoTyosopimus(työsopimus_id);

  if (tyosopimus === null) {
    res.sendStatus(StatusCode.NotFound);
    return;
  }

  // Tuntihintasopimusta voi aina muokata, urakkaa vain suunnitteluvaiheessa
  const is_tuntihinta = tyosopimus.urakka?.id === null;
  const is_urakka = tyosopimus.urakka?.id !== null;
  const is_editable =
    (tyosopimus.tyosopimus.tila === ContractState.InDesign && is_urakka) ||
    is_tuntihinta;
  const tyosopimus_yhteissumma = await laskeSopimusHinta(työsopimus_id);

  // Teoriassa karsitummat tiedot riittäisivät, mutta tässä haetaan kaikki
  // TODO refaktoroinnissa luo suppeampi interface ja käytä sitä
  const muokaamattomatLaskut = await haeKokoLaskut(työsopimus_id);
  const laskut = [];

  for (const lasku of muokaamattomatLaskut) {
    const expired =
      lasku['era_pvm'] < new Date() && lasku['maksettu_pvm'] === null;
    const hasReminder = await hasMuistutusLasku(lasku.id);
    laskut.push({
      ...lasku,
      expired,
      showExpiredButton: !hasReminder && expired,
    });
  }

  const renderOptions = {
    ...tyosopimus,
    laskut,
    is_tuntihinta: is_tuntihinta,
    is_urakka: is_urakka,
    tilat: ContractState,
    is_editable,
    tyosopimus_yhteissumma,
  };

  const tyosuoritukset = await haeTyosuoritukset(työsopimus_id);
  const tarvikkeet = await haeTarvikkeet(työsopimus_id);
  Object.assign(renderOptions, {tyosuoritukset, tarvikkeet});

  res.render('tyosopimukset/id', renderOptions);
});

// Uusi työsopimus -modaali-ikkuna
router.get('/uusi', async (_req, res) => {
  console.log('uusi työsopimus');
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosopimukset/uusiTyosopimus', {tyokohteet, asiakkaat});
});

// Uusi työkohde -modaali-ikkuna
router.get('/tyokohde/uusi', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
});

// Vaihda työsopimuksen tilaa ja päivitä urakan hinta
router.patch('/:id', async (req, res) => {
  const tid = parseInt(req.params.id);
  const tila = req.body.tila;

  if (
    (await updateTyosopimusState(tid, tila)) &&
    tila === ContractState.InProgress
  ) {
    paivitaUrakkaHinta(tid);
  }

  res.set('hx-refresh', 'true').sendStatus(StatusCode.OK);
});

// Lisää uusi työsopimus tietokantaan
router.post('/', async (req, res) => {
  // TODO refaktoroi tämäkin spaghetti järkevämmäksi
  const ts: Tyosopimus = {
    id: null, // id generoidaan tietokannassa
    urakka_id: null, // id generoidaan tietokannassa
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
