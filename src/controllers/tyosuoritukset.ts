import {Router} from 'express';
import {
  getTyosuoritukset,
  getTyoSuoritusById,
  getDataById,
} from '../models/tyosuoritukset';
import {StatusCode} from '../constants/statusCodes';
const router = Router();

router.get('/form', (_req, res) => {
  res.render('tyosuoritukset/form');
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const tyosuoritus = await getTyoSuoritusById(id);

    // tää koko läjä pitäis siirtää modelin puolelle :D
    // ja palauttaa sieltä vaan 1 objekti, ehkä..
    const tarvikkeet = await getDataById(id, 'tyosuoritusTarvikkeet.sql');
    const laskut = await getDataById(id, 'tyosuoritusLaskut.sql');
    const tuntihinnat = await getDataById(id, 'tyosuoritusTuntihinnat.sql');

    /*     console.log('tyosuoritus:', tyosuoritus[0]);
    console.log('tarvikkeet:', tarvikkeet);
    console.log('laskut:', laskut);
    console.log('tuntihinnat:', tuntihinnat); */

    res.render('tyosuoritukset/tyosuoritus', {
      tyosuoritus: tyosuoritus[0]?.tyosuoritus,
      asiakas: tyosuoritus[0]?.asiakas,
      tyokohde: tyosuoritus[0]?.tyokohde,
      tarvikkeet,
      laskut,
      tuntihinnat,
      kokonaissumma: 666, // TODO laske kokonaissumma
    });
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.get('/', async (_req, res) => {
  try {
    const tyosuoritukset = await getTyosuoritukset();
    res.render('tyosuoritukset', {tyosuoritukset});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

// TODO: Kun lähdet tekemään interfacea, niin tee siitä jotakuinkin tällainen,
// mutta lisää siihen kaikki tarvittavat kentät. Tämä on vain esimerkki.
// En ole myöskään täysin päättänyt, kannattaako osa kentistä laskea frontendin
// vai backendin puolella. Kaikesta voi neuvotella.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* const _TYOT = [
  {
    kokonaissumma: 967,
    tyosuoritus: {
      id: 1,
      tyyppi: 'tuntityö',
      tila: 'tehdään',
      aloitus_pvm: '1.9.2023',
    },
    tyokohde: {
      osoite: 'Kotikatu 1',
      postitoimipaikka: 'Helsinki',
      postinumero: '00100',
      tyyppi: 'omakotitalo',
    },
    asiakas: {
      id: 1,
      nimi: 'Jarmo Asiakas',
      osoite: 'Kujankuja 1 A',
      postinumero: '23143',
      postitoimipaikka: 'YlempiJärvi',
      sahkoposti: 'jarmo.asiakas@gmail.com',
      puhelinnumero: '044 1234567',
    },
    laskut: [
      {
        id: 1,
        edellinen_lasku: null,
        summa: 5000,
        pvm: '1.9.2023', // Päivämäärät olioina?
        era_pvm: '20.10.2023',
        maksettu_pvm: '1.11.2023',
        tila: 'Maksettu', // Luo tämä teksti frontendissä eikä backendissä?
        jarjestysluku: 1,
      },
      {
        id: 2,
        edellinen_lasku: null,
        summa: 4000,
        pvm: '2.9.2023',
        era_pvm: '22.10.2023',
        maksettu_pvm: null,
        tila: 'Ei maksettu',
        jarjestysluku: 2,
      },
      {
        id: 2,
        edellinen_lasku: null,
        summa: 3000,
        pvm: '3.9.2023',
        era_pvm: '23.10.2023',
        maksettu_pvm: '4.9.2023',
        tila: 'Maksettu',
        jarjestysluku: 0,
      },
    ],
    tarvikkeet: [
      {
        nimi: 'Sähköjohto, 5mm, kupari',
        toimittaja: 'Toimittaja Oy',
        merkki: 'Sähkötin',
        tyyppi: 'johto',
        maara: 20,
        yksikko: 'm',
        hinta_ulos: 8,
        aleprosentti: 0,
        hinta: 8 * 20,
        alv: 8 * 20 * 0.24,
        hinta_yhteensa: 8 * 20 + 8 * 20 * 0.24,
      },
    ],
    tuntihinnat: [
      {
        pvm: '12.1.2023',
        tyyppi: 'suunnittelu',
        alv_prosentti: 0.24,
        aleprosentti: 0,
        tuntihinta: 30,
        tunnit: 3,
        hinta: 90,
        alv: 21.6,
        hinta_yhteensa: 90 + 21.6,
      },
      {
        pvm: '13.1.2023',
        tyyppi: 'työ',
        alv_prosentti: 0.24,
        aleprosentti: 0,
        tuntihinta: 50,
        tunnit: 2,
        hinta: 100,
        alv: 24,
        hinta_yhteensa: 100 + 24,
      },
    ],
  },
]; */

export default router;
