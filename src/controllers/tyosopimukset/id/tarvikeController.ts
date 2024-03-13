import {Router} from 'express';
import {retrieveWarehouseItems} from '../../../models/tarvikeModel';
const router = Router();

router.get('/:id/tarvikkeet/hinta', (req, res) => {
  if (!req.query['varastotarvike_id']) {
    res.status(400).send();
    return;
  }
  // TODO: Siirrä modeliin?
  const query = {
    maara: Number(req.query['maara']),
    hinta_ulos: Number(req.query['hinta_ulos']),
    aleprosentti: Number(req.query['aleprosentti']),
    alv_prosentti: Number(req.query['alv_prosentti']),
  };
  const hinta = query.maara * query.hinta_ulos;
  const ale_hinta = hinta * (1 - query.aleprosentti / 100);
  const alv = ale_hinta * (query.alv_prosentti / 100);
  const yht_hinta = ale_hinta + alv;
  res.render('tyosopimukset/id/tarvikkeet/hinta', {
    aleprosentti: query.aleprosentti,
    ale_hinta: ale_hinta.toFixed(2),
    hinta: hinta.toFixed(2),
    alv: alv.toFixed(2),
    yht_hinta: yht_hinta.toFixed(2),
  });
});

router.get('/:id/tarvikkeet/uusiTarvike', async (req, res) => {
  const id = Number(req.params.id);
  console.log('Hae varastotarvikkeet tietokannasta');
  const vt = await retrieveWarehouseItems();
  res.render('tyosopimukset/id/tarvikkeet/uusiTarvike', {
    vt,
    id,
    layout: 'modal',
  });
});

router.get('/:id/tarvikkeet/:varastotarvike_id', (_req, res) => {
  // const varastotarvike_id = Number(req.params.varastotarvike_id);
  // Hae req.params.varastotarvike_id vastaava varastotarvike tietokannasta
  // console.log(req.params.varastotarvike_id);
  const varastotarvike = {
    id: '1',
    toimittaja_id: 'toimittaja_id',
    nimi: 'nimi',
    merkki: 'merkki',
    tyyppi: 'tyyppi',
    varastotilanne: 5,
    yksikko: 'kpl',
    hinta_sisaan: 5,
  };
  res.render('tyosopimukset/id/tarvikkeet/id', {
    ...varastotarvike,
    default_hinta_ulos: varastotarvike.hinta_sisaan * 1.25,
  });
});

router.post('/:id/tarvikkeet', (_req, res) => {
  // TODO: Tallenna tietokantaan
  // console.log(req.body);
  res.set('hx-refresh', 'true');
  res.sendStatus(201);
});

export default router;
