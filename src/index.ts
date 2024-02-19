import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import t1 from './controller/t1';
import partials from './controller/partial';

dotenv.config();
const app = express();
const port = process.env['PORT'];

// Middlewaret
app.use(morgan('tiny')); // Logger
app.use(express.urlencoded({extended: true})); // Parse POST data

// Routerit
app.use('/t1', t1);
app.use('/par', partials);

// Staattiset tiedostot
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
