import {Router} from 'express';
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
  res.render('tyosuoritukset/id/tyot/hinta', {
    aleprosentti: query.aleprosentti,
    ale_hinta: ale_hinta.toFixed(2),
    hinta: hinta.toFixed(2),
    alv: alv.toFixed(2),
    yht_hinta: yht_hinta.toFixed(2),
  });
});

router.get('/:id/tyot/uusi', (req, res) => {
  const id = Number(req.params.id);
  const BACKEND_DATA = {
    tuntihintatyypit: [
      {
        id: 1,
        tyyppi: 'Suunnittelu',
        hinta: 24,
      },
      {
        id: 2,
        tyyppi: 'Aputyö',
        hinta: 28,
      },
    ],
  };
  res.render('tyosuoritukset/id/tyot/uusi', {
    ...BACKEND_DATA,
    id,
    layout: 'modal',
  });
});

router.post('/:id/tyot', (_req, res) => {
  // TODO: Tallenna tietokantaan
  // console.log(req.body);
  res.set('hx-refresh', 'true');
  res.sendStatus(201);
});

export default router;
