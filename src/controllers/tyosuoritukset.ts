import {Router} from 'express';
const router = Router();

const TYOT = [
  {
    tyosuoritus: {
      id: 1,
      tyyppi: 'tuntityö',
      tila: 'tehdään',
      aloitus_pvm: '1.9.2023',
    },
    tyokohde: {
      osoite: 'Kotikatu 1',
      postitoimipaikka: 'Helsinki',
      tyyppi: 'omakotitalo',
    },
    asiakas: {
      nimi: 'Jarmo Asiakas',
    },
  },
  {
    tyosuoritus: {
      id: 2,
      tyyppi: 'urakka',
      tila: 'suunnitellaan',
      aloitus_pvm: '1.2.2024',
    },
    tyokohde: {
      osoite: 'Saunatie 1',
      postitoimipaikka: 'Tampere',
      tyyppi: 'Kesämökki',
    },
    asiakas: {
      nimi: 'Pauliina Kustomeri',
    },
  },
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
