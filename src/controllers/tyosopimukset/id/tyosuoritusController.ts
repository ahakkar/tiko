import {Router} from 'express';
import {
  getTuntihintatyypit,
  getTuntihintatyyppi,
  lisaaTyosuoritus,
  validoiTyosuoritus,
} from '../../../models/tyosuoritusModel';
import {StatusCode} from '../../../constants/statusCode';
import {Tuntihinta} from '../../../models/interfaces';
const router = Router();

router.get('/:id/tyot/hinta', async (req, res) => {
  if (!req.query['tuntihintatyyppi_id']) {
    res.status(400).send();
    return;
  }

  const tht_id = Number(req.query['tuntihintatyyppi_id']);
  const tuntihintatyyppi = await getTuntihintatyyppi(tht_id);

  const query = {
    tunnit: Number(req.query['tunnit']),
    aleprosentti: Number(req.query['aleprosentti']),
    alv_prosentti: Number(req.query['alv_prosentti']),
  };

  const hinta = tuntihintatyyppi['tuntihinta'] * query.tunnit;
  const ale_hinta = hinta * (1 - query.aleprosentti / 100);
  const alv = ale_hinta * (query.alv_prosentti / 100);
  const yht_hinta = ale_hinta + alv;

  res.render('tyosopimukset/id/tyot/hinta', {
    aleprosentti: query.aleprosentti,
    ale_hinta: ale_hinta.toFixed(2),
    hinta: hinta.toFixed(2),
    alv: alv.toFixed(2),
    yht_hinta: yht_hinta.toFixed(2),
  });
});

router.get('/:id/tyot/uusiTyosuoritus', async (req, res) => {
  const id = Number(req.params.id);
  const tht = await getTuntihintatyypit();
  console.log(tht);
  res.render('tyosopimukset/id/tyot/uusiTyosuoritus', {
    tht,
    id,
    layout: 'modal',
  });
});

router.post('/:id/tyosuoritus', async (req, res) => {
  console.log('Lisätään uusi työsuoritus');

  const n: Tuntihinta = {
    tyosuoritus_id: Number(req.params.id),
    tuntihintatyyppi_id: Number(req.body.tuntihintatyyppi_id),
    alv_prosentti: Number(req.body.alv_prosentti) / 100,
    aleprosentti: Number(req.body.aleprosentti) / 100,
    tunnit: Number(req.body.tunnit),
    // näitä ei tarvita, mutta interfacen takia pitää olla
    tuntihinta_id: -1,
    tyyppi: '',
    pvm: new Date(),
    tuntihinta: '',
    hinta: '',
    alv: '',
    hinta_yhteensa: '',
  };

  console.log(n);

  if (!validoiTyosuoritus(n)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  console.log(n);

  if (await lisaaTyosuoritus(n)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

export default router;
