import {Router} from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.send('<div>Hello World!</div>');
});

router.post('/', (_req, res) => {
  console.log(_req.body);
  const {name, address} = _req.body;
  console.log(`Vastaanotettu T1 tiedoilla: ${name}, ${address}`);
  res.send(`<div>Työkohde ${address} on lisätty asiakkaalle ${name}.</div>`);
});

export default router;
