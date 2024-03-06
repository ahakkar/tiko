import {Router} from 'express';
const router = Router();

router.get('/:id/tarvikkeet/uusi', (req, res) => {
  const id = Number(req.params.id);
  const BACKEND_DATA = {};
  res.render('tyosuoritukset/id/tarvikkeet/uusi', {
    ...BACKEND_DATA,
    id,
    layout: 'modal',
  });
});

router.post('/:id/tarvikkeet', (req, res) => {
  console.log(req.body);
  res.set('hx-refresh', 'true');
  res.sendStatus(201);
});

export default router;
