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
  haeAlvErittely,
} from '../../models/tyosopimusModel';
import tyot from './id/tyosuoritusController';
import tarvikkeet from './id/tarvikeController';
import laskut from './id/laskuController';
import {getTyokohteet} from '../../models/tyokohdeModel';
import {getAsiakkaat} from '../../models/asiakasModel';
import {Erittely, Tyosopimus} from '../../models/interfaces';
import {ContractState, StatusCode} from '../../constants';
import {haeTarvikkeet} from '../../models/tarvikeModel';
import {haeTyosuoritukset} from '../../models/tyosuoritusModel';
import {haeKokoLaskut, hasMuistutusLasku} from '../../models/laskuModel';
import {getDataById} from '../../models/dbModel';

const router = Router();
router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

// Kaikki työsopimukset -sivu
router.get('/', async (_req, res) => {
  const tyosopimukset = await haeTyosopimukset();
  //console.log(tyosopimukset);
  res.render('tyosopimukset/tyosopimukset', {tyosopimukset});
});

// Uusi työsopimus -modaali-ikkuna
router.get('/uusi', async (_req, res) => {
  console.log('uusi työsopimus');
  const tyokohteet = await getTyokohteet();
  const asiakkaat = await getAsiakkaat();

  res.render('tyosopimukset/uusiTyosopimus', {
    layout: 'modal',
    tyokohteet,
    asiakkaat,
  });
});

// Uusi työkohde -modaali-ikkuna
router.get('/tyokohde/uusi', (_req, res) => {
  res.render('tyokohteet/uusiTyokohde', {
    layout: 'modal',
  });
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

  // Tuntihintasopimusta voi aina muokata, urakkaa vain suurjannitteluvaiheessa
  const is_tuntihinta = tyosopimus.urakka?.id === null;
  const is_urakka = tyosopimus.urakka?.id !== null;
  const isDisabled =
    (tyosopimus.tyosopimus.tila !== ContractState.InDesign && is_urakka) ||
    tyosopimus.tyosopimus.tila === ContractState.Completed;
  const summat = await laskeSopimusHinta(työsopimus_id);
  const alv_erittely = await haeAlvErittely(työsopimus_id);
  const tyosuoritukset = await haeTyosuoritukset(työsopimus_id);
  const tarvikkeet = await haeTarvikkeet(työsopimus_id);
  const tarvike_erittely = await getDataById<Erittely>(
    työsopimus_id,
    'tarvikeErittely.sql'
  );
  const tyosuoritus_erittely = await getDataById<Erittely>(
    työsopimus_id,
    'tyosuoritusErittely.sql'
  );

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
    isDisabled,
    summat,
    alv_erittely,
    tyosuoritukset,
    tarvikkeet,
    tarvike_erittely,
    tyosuoritus_erittely,
  };

  res.render('tyosopimukset/id/tyosopimus', renderOptions);
});

export default router;
