import {Router} from 'express';
import {retrieveSuppliers} from '../models/toimittajat';

const router = Router();

router.get('/', async (_req, res) => {
  const suppliers = await retrieveSuppliers();
  res.render('toimittajat/toimittajat', {toimittajat: suppliers});
});

router.get('/:id', (req, res) => {
  res.send(`<div>Toimittaja ${req.params.id}</div>`);
});

export default router;
