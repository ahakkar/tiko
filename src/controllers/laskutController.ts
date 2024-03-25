import {Router} from 'express';
import {
  addMuistutusLasku,
  getLaskuAsiakasKohde,
  haeKokoLasku,
} from '../models/laskuModel';
import {StatusCode} from '../constants';
import {lisaaLasku, validoiLasku} from '../models/laskuModel';
import {Lasku, LaskuAsiakasKohde} from '../models/interfaces';
import {haeKokoTyosopimus} from '../models/tyosopimusModel';
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

// Näyttää kaikki laskut, jos laskuId:tä ei ole annettu.
// Muuten näyttää yhden laskun tiedot.
router.get('/', async (req, res) => {
  const laskuId = Number(req.query['laskuId']);

  if (!laskuId) {
    const laskut: LaskuAsiakasKohde[] = await getLaskuAsiakasKohde();
    res.render('laskut', {laskut: laskut});
    return;
  }

  const lasku = await haeKokoLasku(laskuId);
  const työsopimus_id = lasku.tyosuoritus_id;
  const tyosopimus = await haeKokoTyosopimus(työsopimus_id);

  // Haetaan suoritukset ja tarvikkeet jos kyseessä on tuntityösopimus
  if (tyosopimus.urakka?.id === null) {
    const tyosuoritukset = await haeTyosuoritukset(työsopimus_id);
    const tarvikkeet = await haeTarvikkeet(työsopimus_id);

    res.render('laskut/lasku', {
      lasku,
      ...tyosopimus,
      tyosuoritukset,
      tarvikkeet,
    });
  } else {
    res.render('laskut/lasku', {lasku, ...tyosopimus});
  }
});

export default router;
