import {Router} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getKayttaja} from '../models/kirjauduModel';
const router = Router();

router.get('/', async (_req, res) => {
  res.render('kirjaudu');
});

router.post('/', async (req, res) => {
  const {username, password} = req.body;
  // const passwordHash = await bcrypt.hash(password, 10);
  // console.log(username, passwordHash);

  const kayttaja = await getKayttaja(username);
  // console.log(kayttaja);
  if (
    !kayttaja ||
    !(await bcrypt.compare(password, kayttaja.salasanatiiviste))
  ) {
    // Täytyy palauttaa 200, koska muuten HTMX ei toimi
    res.status(200).send('Väärä käyttäjänimi tai salasana!');
    return;
  }

  // Kirjautuminen onnistui
  const token = jwt.sign(kayttaja, process.env['JWT_SECRET']!, {
    expiresIn: process.env['JWT_EXPIRE']!,
  });
  // console.log(token);
  res
    .cookie('login', token)
    .set('hx-redirect', '/tyosopimukset')
    .status(200)
    .send();
});

export default router;
