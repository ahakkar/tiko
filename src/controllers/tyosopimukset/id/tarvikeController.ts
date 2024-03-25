import {Router} from 'express';
import {
  retrieveWarehouseItem,
  retrieveWarehouseItems,
} from '../../../models/tarvikeModel';
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

router.get('/:id/tarvikkeet/uusi', async (req, res) => {
  const id = Number(req.params.id);
  const vt = await retrieveWarehouseItems();
  res.render('tyosopimukset/id/tarvikkeet/uusiTarvike', {
    vt,
    id,
    layout: 'modal',
  });
});

router.get('/:id/tarvikkeet/:varastotarvike_id', async (req, res) => {
  const vt = await retrieveWarehouseItem(Number(req.params.varastotarvike_id));
  res.render('tyosopimukset/id/tarvikkeet/id', {
    vt,
    default_hinta_ulos: vt.hinta_sisaan * 1.25,
  });
});

export default router;
