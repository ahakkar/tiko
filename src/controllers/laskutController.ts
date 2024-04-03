import {Router} from 'express';
import {
  addMuistutusLasku,
  getLaskuAsiakasKohde,
  haeKokoLasku,
} from '../models/laskuModel';
import {StatusCode} from '../constants';
import {lisaaLasku, validoiLasku} from '../models/laskuModel';
import {Lasku, LaskuAsiakasKohde} from '../models/interfaces';
import {haeAlvErittely, haeKokoTyosopimus} from '../models/tyosopimusModel';
import {haeTarvikkeet} from '../models/tarvikeModel';
import {haeTyosuoritukset} from '../models/tyosuoritusModel';

const router = Router();

/**
 * Tallentaa työsopimukseen {id} viittaavan laskun
 * tietokantaan
 */
router.post('/', async (req, res) => {
  // Jos laskulla on edellinen lasku, se on muistutuslasku.
  if (req.body.edellinen_lasku) {
    await addMuistutusLasku(req.body.era_pvm, req.body.edellinen_lasku);
  } else {
    const l: Lasku = {
      tyosuoritus_id: Number(req.body.tyosuoritus_id),
      summa: Number(req.body.summa),
      pvm: new Date(),
      era_pvm: new Date(req.body.era_pvm),
    };
    console.log('tallennetaan lasku', req.body);

    if (!validoiLasku(l)) {
      res.sendStatus(StatusCode.BadRequest);
      return;
    }

    if (!(await lisaaLasku(l))) {
      res.sendStatus(StatusCode.InternalServerError);
      return;
    }
  }

  res.set('hx-refresh', 'true');
  res.sendStatus(StatusCode.OK);
});

// Kaikki laskut
router.get('/', async (_req, res) => {
  const laskut: LaskuAsiakasKohde[] = await getLaskuAsiakasKohde();
  res.render('laskut/laskut', {laskut: laskut});
});

// Yksi lasku
router.get('/:id', async (req, res) => {
  const laskuId = parseInt(req.params.id);
  const lasku = await haeKokoLasku(laskuId);
  const työsopimus_id = lasku.tyosuoritus_id;
  const tyosopimus = await haeKokoTyosopimus(työsopimus_id);
  const alv_erittely = await haeAlvErittely(työsopimus_id);

  // Haetaan suoritukset ja tarvikkeet jos kyseessä on tuntityösopimus
  if (tyosopimus.urakka?.id === null) {
    const tyosuoritukset = await haeTyosuoritukset(työsopimus_id);
    const tarvikkeet = await haeTarvikkeet(työsopimus_id);

    res.render('laskut/lasku', {
      lasku,
      ...tyosopimus,
      tyosuoritukset,
      tarvikkeet,
      alv_erittely,
    });
  } else {
    res.render('laskut/lasku', {lasku, ...tyosopimus, alv_erittely});
  }
});

export default router;
