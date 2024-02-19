import {Router} from 'express';
import path from 'path';
import fs from 'fs';

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

  console.log(filePath);

  // File exists? check
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.status(404).send('Page not found');
    } else {
      res.sendFile(filePath);
    }
  });
});

export default router;
