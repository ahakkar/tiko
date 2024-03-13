import {Router} from 'express';
import {DateTime} from 'luxon';
const router = Router();

router.get('/:id/laskut/uusi', (req, res) => {
  const id = Number(req.params.id);
  const max_summa = 100;
  res.render('tyosopimukset/id/laskut/uusi', {
    max_summa,
    id,
    today: DateTime.now().toFormat('yyyy-MM-dd'),
    default_era_pvm: DateTime.now().plus({months: 1}).toFormat('yyyy-MM-dd'),
    layout: 'modal',
  });
});

router.post('/:id/laskut', (_req, res) => {
  // TODO: Tallenna tietokantaan
  // console.log(req.body);
  res.set('hx-refresh', 'true');
  res.sendStatus(201);
});

export default router;
