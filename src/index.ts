import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import t1 from './controller/t1';
import fs from 'fs';

dotenv.config();
const app = express();
const port = process.env['PORT'];
const path = require('path');

// Middlewaret
app.use(morgan('tiny')); // Logger
app.use(express.urlencoded({extended: true})); // Parse POST data

// Routerit
app.use('/t1', t1);

// Staattiset tiedostot
app.use(express.static('public'));

// Servaa osittaiset näkymät
app.get('/par/:pageName', (req, res) => {
  const filePath = path.join(
    __dirname,
    'view',
    'par',
    `${req.params.pageName}.htm`
  );

  // File exists? check
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.status(404).send('Page not found');
    } else {
      res.sendFile(filePath);
    }
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
