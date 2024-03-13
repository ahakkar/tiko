import {Router} from 'express';
import multer, {FileFilterCallback} from 'multer';
import {XMLParser} from 'fast-xml-parser';
import {
  retrieveWarehouseItem,
  retrieveWarehouseItems,
  validateNewWarehouseItems,
  addNewWarehouseItems,
} from '../models/tarvikkeetModel';
import {retrieveSupplier} from '../models/toimittajatModel';
import {Request} from 'express-serve-static-core';
import {NewWarehouseItems} from '../models/interfaces';
import {makeTransaction} from '../models/dbModel';
import {PoolClient} from 'pg';

const router = Router();

// Hyväksy ainoastaan XML-tiedostoja
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (file.mimetype !== 'text/xml' && file.mimetype !== 'application/xml') {
    callback(null, false);
  } else {
    callback(null, true);
  }
};

const upload = multer({fileFilter});

router.get('/', async (_req, res) => {
  const warehouseItems = await retrieveWarehouseItems();
  res.render('tarvikkeet/tarvikkeet', {warehouseItems});
});

router.get('/:id', async (req, res) => {
  const item = await retrieveWarehouseItem(parseInt(req.params.id));
  const toimittaja = await retrieveSupplier(item.toimittaja_id);

  res.render('tarvikkeet/tarvike', {item, toimittaja});
});

router.post('/lataa', upload.array('items-files'), async (req, res) => {
  if (!req.files || !(req.files instanceof Array)) {
    throw new Error('Tiedostoa ei löytynyt');
  }

  const xmlParser = new XMLParser();
  for (const file of req.files) {
    const newItems: NewWarehouseItems = xmlParser.parse(file.buffer);

    // Jos tarvikkeita on tiedostossa vain yksi, XML-parseri ei palauta tarvike-objektia taulukkona,
    // joten muutetaan se siinä tapauksessa taulukoksi manuaalisesti
    if (!(newItems.tarvikkeet.tarvike instanceof Array)) {
      newItems.tarvikkeet.tarvike = [newItems.tarvikkeet.tarvike];
    }
    if (!validateNewWarehouseItems(newItems)) {
      throw new Error('Virheellinen XML-tiedosto');
    }
    // Lisätään uudet tarvikkeet tietokantaan
    await makeTransaction(async (client: PoolClient) => {
      await addNewWarehouseItems(newItems, client);
    });
  }

  const items = await retrieveWarehouseItems();

  res.render('tarvikkeet/tarvikkeet', {warehouseItems: items});
});

export default router;
