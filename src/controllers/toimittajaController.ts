import {Router} from 'express';
import {
  retrieveSupplier,
  retrieveSuppliers,
  retrieveUsedItemsBySupplier,
} from '../models/toimittajaModel';

const router = Router();

router.get('/', async (_req, res) => {
  const suppliers = await retrieveSuppliers();
  res.render('toimittajat/toimittajat', {toimittajat: suppliers});
});

router.get('/:id', async (req, res) => {
  const supplier = await retrieveSupplier(parseInt(req.params.id));
  // Retrieve used items by supplier
  const itemInfo = await retrieveUsedItemsBySupplier(supplier.id);
  res.render('toimittajat/toimittaja', {
    toimittaja: supplier,
    tavaraInfo: itemInfo,
  });
});

export default router;
