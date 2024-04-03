import {Router} from 'express';
import multer, {FileFilterCallback} from 'multer';
import {XMLParser} from 'fast-xml-parser';
import {
  retrieveWarehouseItem,
  retrieveWarehouseItems,
  validateNewWarehouseItems,
  addNewWarehouseItems,
  updateWarehouseItem,
  lisaaTarvike,
  validoiTarvike,
} from '../models/tarvikeModel';
import {retrieveSupplier} from '../models/toimittajaModel';
import {Request} from 'express-serve-static-core';
import {NewWarehouseItems, Tarvike} from '../models/interfaces';
import {makeTransaction} from '../models/dbModel';
import {PoolClient} from 'pg';
import {StatusCode} from '../constants';

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
  const warehouseItems = await retrieveWarehouseItems('FALSE');
  res.render('tarvikkeet/tarvikkeet', {warehouseItems});
});

router.get('/arkisto', async (_req, res) => {
  console.log('siirrytään arkistoon');
  const warehouseItems = await retrieveWarehouseItems('TRUE');
  console.log('noh toimiiko');
  res.render('tarvikkeet/arkisto', {warehouseItems});
});

router.get('/:id', async (req, res) => {
  const item = await retrieveWarehouseItem(parseInt(req.params.id));
  const toimittaja = await retrieveSupplier(item.toimittaja_id);

  res.render('tarvikkeet/tarvike', {item, toimittaja});
});

router.get('/:id/tarvikkeet/uusi', (_req, res) => {
  res.render('tarvikkeet/uusiTarvike', {
    layout: 'modal',
  });
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

  const items = await retrieveWarehouseItems('FALSE');

  res.render('tarvikkeet/tarvikkeet', {warehouseItems: items});
});

router.post('/', async (req, res) => {
  const id: number = req.body.tyosuoritus_id;

  const n: Tarvike = {
    tyosuoritus_id: id,
    varastotarvike_id: Number(req.body.varastotarvike_id),
    maara: Number(req.body.maara),
    hinta_ulos: req.body.hinta_ulos,
    aleprosentti: (Number(req.body.aleprosentti) / 100).toString(),
    alv_prosentti: (Number(req.body.alv_prosentti) / 100).toString(),

    // näitä ei tarvita, mutta interfacen takia pitää olla
    // TODO tällekin saa miettiä paremman ratkaisun
    id: -1,
    nimi: '',
    hinta: '',
    pvm: new Date(),
    hinta_sisaan: '',
    hinta_yhteensa: '',
    alv: '',
    yksikko: '',
  };

  if (!validoiTarvike(n)) {
    res.sendStatus(StatusCode.BadRequest);
    return;
  }

  if (await lisaaTarvike(n)) {
    res.set('hx-refresh', 'true');
    res.sendStatus(StatusCode.OK);
    return;
  }

  res.sendStatus(StatusCode.InternalServerError);
});

router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const {vanhentunut} = req.body;
  await updateWarehouseItem(id, vanhentunut);
  res.set('hx-refresh', 'true').send();
});

export default router;
