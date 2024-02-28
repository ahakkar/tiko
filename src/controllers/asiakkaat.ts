import {Router} from 'express';
const router = Router();

const ASIAKKAAT = [
  {
    id: 1,
    nimi: 'Jarmo Asiakas',
    osoite: 'Kujankuja 1 A',
    postinumero: '23143',
    postitoimipaikka: 'YlempiJärvi',
    sahkoposti: 'jarmo.asiakas@gmail.com',
    puhelinnumero: null,
  },
  {
    id: 2,
    nimi: 'Kaisa Kekkonen',
    osoite: 'Kujankuja 1 B',
    postinumero: '23143',
    postitoimipaikka: 'YlempiJärvi',
    sahkoposti: null,
    puhelinnumero: '044 1234568',
  },
];

router.get('/', (_req, res) => {
  res.render('asiakkaat', {asiakkaat: ASIAKKAAT});
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

export default router;
