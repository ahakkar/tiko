import {Router} from 'express';
import path from 'path';
import fs from 'fs';
import {StatusCode} from '../constants/statusCodes';

const router = Router();

// Serve partial views
router.get('/:pageName', (req, res) => {
  const filePath = path.join(
    __dirname,
    '..', // src
    'view',
    'par',
    `${req.params.pageName}.htm`
  );

  // File exists? check
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.status(StatusCode.BadRequest).send('Page not found');
    } else {
      res.sendFile(filePath);
    }
  });
});

export default router;
