import {Router} from 'express';
import {getAsiakkaat} from '../models/asiakkaat';
import {StatusCode} from '../constants/statusCodes';
const router = Router();

router.get('/', async (_req, res) => {
  try {
    const asiakkaat = await getAsiakkaat();
    res.render('asiakkaat', {asiakkaat});
  } catch (error) {
    res.status(StatusCode.NotFound).send();
  }
});

router.post('/', (_req, res) => {
  res.send('<div>TODO</div>');
});

export default router;
