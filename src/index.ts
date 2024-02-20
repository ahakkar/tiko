import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import customers from './controller/customers';
import products from './controller/products';
import projects from './controller/projects';
import worksites from './controller/worksites';

dotenv.config();
const app = express();
const port = process.env['PORT'];

// Middlewaret
app.use(morgan('tiny')); // Logger
app.use(express.urlencoded({extended: true})); // Parse POST data

// Routerit
app.use('/customers', customers);
app.use('/products', products);
app.use('/projects', projects);
app.use('/worksites', worksites);

// Staattiset tiedostot
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
