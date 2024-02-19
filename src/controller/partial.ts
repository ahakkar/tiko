import {Router} from 'express';
import * as t1Controller from '../controller/t1';

const router = Router();

router.get('/:pageName', (req, res) => {
  const {pageName} = req.params;

  // Ihan hirveä ratkaisu. Tämä pitäisi korvata jollain järkevämmällä.
  switch (pageName) {
    case 't1':
      t1Controller.render(req, res);
      break;
    case 't2':
      res.send('Handling T2');
      break;
    case 't3':
      res.send('Handling T3');
      break;
    case 't4':
      res.send('Handling T4');
      break;
    case 't5':
      res.send('Handling T5');
      break;
    case 'r1':
      res.send('Handling R1');
      break;
    case 'r2':
      res.send('Handling R2');
      break;
    case 'r3':
      res.send('Handling R3');
      break;
    case 'r4':
      res.send('Handling R4');
      break;
    case 'r5':
      res.send('Handling R5');
      break;
    case 'r6':
      res.send('Handling R6');
      break;
    default:
      res.status(404).send('Page not found');
  }
});

router.post('/:pageName', (req, res) => {
  console.log('Handling post.');
  const {pageName} = req.params;

  // Sama vika kuin ylhäällä
  switch (pageName) {
    case 't1':
      t1Controller.handlePost(req, res);
      break;
    default:
      res.status(404).send('Page not found');
  }
});

export default router;
