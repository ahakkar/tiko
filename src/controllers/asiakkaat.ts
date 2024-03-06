import {Router} from 'express';
import {getAsiakkaat} from '../models/asiakkaat';
const router = Router();

router.get('/', async (_req, res) => {
  const asiakkaat = await getAsiakkaat();
  res.render('asiakkaat', {asiakkaat});
});

/* router.get('/:id', async (req, res) => {
  try {
    const item = await retrieveWarehouseItem(parseInt(req.params.id));
    const toimittaja = await retrieveSupplier(item.toimittaja_id);

    res.render('tarvike', {item, toimittaja});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
}); */

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

export default router;
