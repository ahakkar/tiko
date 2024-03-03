import {Router} from 'express';
import {getTyokohteet} from '../models/tyokohteet';
import {StatusCode} from '../constants/statusCodes';
const router = Router();

router.get('/', async (_req, res) => {
  try {
    const tyokohteet = await getTyokohteet();
    res.render('tyokohteet', {tyokohteet});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
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
