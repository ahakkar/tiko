import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import t1 from './controller/t1';

dotenv.config();
const app = express();
const port = process.env['PORT'];

// Middlewaret
app.use(morgan('tiny')); // Logger

// Routerit
app.use('/t1', t1);

// Staattiset tiedostot
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
