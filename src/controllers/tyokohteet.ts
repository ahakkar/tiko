import {Router} from 'express';
import {createTyokohde, getTyokohteet} from '../models/tyokohteet';
import multer, {Field} from 'multer';
const router = Router();
const upload = multer();

router.get('/', async (_req, res) => {
  const tyokohteet = await getTyokohteet();
  res.render('tyokohteet', {tyokohteet});
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

router.get('/form', (_req, res) => {
  res.render('tyokohteet/uusi', {
    layout: 'modal',
  });
});

const fields: Field[] = [
  {name: 'tyyppi', maxCount: 1},
  {name: 'osoite', maxCount: 1},
  {name: 'postinumero', maxCount: 1},
  {name: 'postitoimipaikka', maxCount: 1},
];

router.post('/', upload.fields(fields), async (req, res) => {
  const {tyyppi, osoite, postinumero, postitoimipaikka} = req.body;
  await createTyokohde(tyyppi, osoite, postinumero, postitoimipaikka);
  const tyokohteet = await getTyokohteet();
  res.status(200).render('tyokohteet', {tyokohteet});
});

export default router;
