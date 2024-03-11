import {Router} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getKayttaja} from '../models/kirjaudu';
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
  if (!kayttaja) {
    // Täytyy palauttaa 200, koska muuten HTMX ei toimi
    res.status(200).send(`Käyttäjää ${username} ei ole olemassa!`);
    return;
  }
  if (!(await bcrypt.compare(password, kayttaja.salasanatiiviste))) {
    // Täytyy palauttaa 200, koska muuten HTMX ei toimi
    res.status(200).send('Väärä salasana!');
    return;
  }

  // Kirjautuminen onnistui
  const token = jwt.sign(kayttaja, process.env['JWT_SECRET']!, {
    expiresIn: '2h',
  });
  // console.log(token);
  res
    .cookie('login', token)
    .set('hx-redirect', '/tyosuoritukset')
    .status(200)
    .send();
});

export default router;