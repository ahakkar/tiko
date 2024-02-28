import {Router} from 'express';
const router = Router();

const TYOT = [
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
    lasku: [
      {
        id: 1,
        edellinen_lasku: null,
        summa: 5000,
        pvm: '1.9.2023',
        era_pvm: '20.10.2023',
        maksettu_pvm: '1.11.2023',
        tila: 'maksettu',
        jarjestysluku: 1,
      },
      {
        id: 2,
        edellinen_lasku: null,
        summa: 4000,
        pvm: '2.9.2023',
        era_pvm: '22.10.2023',
        maksettu_pvm: null,
        tila: 'valmis',
        jarjestysluku: 1,
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
  // {
  //   tyosuoritus: {
  //     id: 2,
  //     tyyppi: 'urakka',
  //     tila: 'suunnitellaan',
  //     aloitus_pvm: '1.2.2024',
  //   },
  //   tyokohde: {
  //     osoite: 'Saunatie 1',
  //     postitoimipaikka: 'Tampere',
  //     postinumero: '33100',
  //     tyyppi: 'Kesämökki',
  //   },
  //   asiakas: {
  //     nimi: 'Pauliina Kustomeri',
  //   },
  // },
];

router.get('/uusi', (_req, res) => {
  res.render('tyosuoritukset/uusi');
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const tyo = TYOT.find(tyo => tyo.tyosuoritus.id === id);
  if (tyo) {
    res.render('tyosuoritukset/tyosuoritus', tyo);
  } else {
    res.status(404).send('Not found');
  }
});

router.get('/', (_req, res) => {
  res.render('tyosuoritukset', {tyosuoritukset: TYOT});
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

export default router;
