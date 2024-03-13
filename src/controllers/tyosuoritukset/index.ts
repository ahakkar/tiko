import {Router} from 'express';
import {getTyosuoritus, getTyosuoritukset} from '../../models/tyosuoritukset';
import tyot from './id/tyot';
import tarvikkeet from './id/tarvikkeet';
import laskut from './id/laskut';
const router = Router();

router.get('/uusi', (_req, res) => {
  const BACKEND_DATA = {
    tyokohteet: [
      {
        id: 1,
        tyyppi: 'Mökki',
        osoite: 'Mökkitie 1',
        postinumero: '12345',
        postitoimipaikka: 'TAMPERE',
      },
      {
        id: 2,
        tyyppi: 'Omakotitalo',
        osoite: 'Omakuja 2',
        postinumero: '54321',
        postitoimipaikka: 'TAMPERE',
      },
    ],
    asiakkaat: [
      {
        id: 1,
        nimi: 'Matti Meikäläinen',
      },
      {
        id: 2,
        nimi: 'Maija Meikäläinen',
      },
    ],
  };
  res.render('tyosuoritukset/uusi', BACKEND_DATA);
});

router.get('/tyokohde/uusi', (_req, res) => {
  res.render('tyokohteet/uusi', {
    layout: 'modal',
  });
});

router.use(tyot);
router.use(tarvikkeet);
router.use(laskut);

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const koko = await getTyosuoritus(id);
  res.render('tyosuoritukset/id', koko);
});

router.get('/', async (_req, res) => {
  const tyosuoritukset = await getTyosuoritukset();
  res.render('tyosuoritukset', {tyosuoritukset});
});

router.post('/', (_req, res) => {
  // TODO: Tallenna tietokantaan
  // console.log(req.body);
  const id = 1; // TODO: Korvaa luodun työsuorituksen id:llä
  res.set('hx-redirect', `/tyosuoritukset/${id}`);
  res.sendStatus(201);
});

export default router;
