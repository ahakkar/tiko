import {Router} from 'express';
import multer, {FileFilterCallback} from 'multer';
import {XMLParser} from 'fast-xml-parser';
import {
  retrieveSupplier,
  retrieveWarehouseItem,
  retrieveWarehouseItems,
  validateNewWarehouseItems,
  addNewWarehouseItems,
} from '../models/tarvikkeet';
import {StatusCode} from '../constants/statusCodes';
import {Request} from 'express-serve-static-core';
import {NewWarehouseItems} from '../models/interfaces';

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
  try {
    const warehouseItems = await retrieveWarehouseItems();
    res.render('tarvikkeet/tarvikkeet', {warehouseItems});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await retrieveWarehouseItem(parseInt(req.params.id));
    const toimittaja = await retrieveSupplier(item.toimittaja_id);

    res.render('tarvikkeet/tarvike', {item, toimittaja});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.post('/lataa', upload.array('items-files'), async (req, res) => {
  try {
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
      await addNewWarehouseItems(newItems);
    }

    const items = await retrieveWarehouseItems();

    res.render('tarvikkeet/tarvikkeet', {warehouseItems: items});
  } catch (error) {
    res.status(400).send();
  }
});

export default router;
