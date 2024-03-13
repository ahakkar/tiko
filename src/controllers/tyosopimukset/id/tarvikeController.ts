import {Router} from 'express';
import {
  lisaaTarvike,
  retrieveWarehouseItem,
  retrieveWarehouseItems,
  validoiTarvike,
} from '../../../models/tarvikeModel';
import {StatusCode} from '../../../constants/statusCode';
import {Tarvike} from '../../../models/interfaces';
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

router.get('/:id/tarvikkeet/:varastotarvike_id', async (req, res) => {
  const vt = await retrieveWarehouseItem(Number(req.params.varastotarvike_id));
  res.render('tyosopimukset/id/tarvikkeet/id', {
    vt,
    default_hinta_ulos: vt.hinta_sisaan * 1.25,
  });
});

router.post('/:id/tarvike', async (req, res) => {
  console.log('Lisätään uusi tarvike');
  const id = Number(req.params.id);

  const n: Tarvike = {
    tyosuoritus_id: id,
    varastotarvike_id: Number(req.body.varastotarvike_id),
    maara: Number(req.body.maara),
    hinta_ulos: Number(req.body.hinta_ulos),
    aleprosentti: Number(req.body.aleprosentti) / 100,
    alv_prosentti: Number(req.body.alv_prosentti) / 100,

    // näitä ei tarvita, mutta interfacen takia pitää olla
    id: -1,
    nimi: '',
    hinta: -1,
    pvm: new Date(),
    hinta_sisaan: -1,
    hinta_yhteensa: -1,
    alv: -1,
  };

  if (!validoiTarvike(n)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  console.log(n);

  if (await lisaaTarvike(n)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
