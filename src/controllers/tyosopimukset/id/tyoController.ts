import {Router} from 'express';
import {
  getTuntihintatyypit,
  lisaaTyosuoritus,
  validoiTyosuoritus,
} from '../../../models/tyoModel';
import {StatusCode} from '../../../constants/statusCode';
import {Tuntihinta} from '../../../models/interfaces';
const router = Router();

router.get('/:id/tyot/hinta', (req, res) => {
  if (!req.query['tuntihintatyyppi']) {
    res.status(400).send();
    return;
  }
  // TODO: Hae req.query['tuntihintatyyppi'] vastaava hinta tietokannasta
  // console.log(req.query);
  const tuntihintatyyppi = {
    tyyppi: 'Suunnittelu',
    tuntihinta: 24,
  };
  const query = {
    tunnit: Number(req.query['tunnit']),
    aleprosentti: Number(req.query['aleprosentti']),
    alv_prosentti: Number(req.query['alv_prosentti']),
  };
  const hinta = tuntihintatyyppi.tuntihinta * query.tunnit;
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

router.get('/:id/tyot/uusiTyo', async (req, res) => {
  const id = Number(req.params.id);
  const tht = await getTuntihintatyypit();
  console.log(tht);
  res.render('tyosopimukset/id/tyot/uusiTyo', {
    tht,
    id,
    layout: 'modal',
  });
});

router.post('/:id/tyot', async (req, res) => {
  console.log('Lisätään uusi työsuoritus');

  const n: Tuntihinta = {
    tyosuoritus_id: Number(req.params.id),
    tuntihintatyyppi_id: Number(req.body.tuntihintatyyppi),
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
