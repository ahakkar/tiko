import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import customers from './controllers/customers';
import products from './controllers/products';
import projects from './controllers/projects';
import worksites from './controllers/worksites';

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
  console.log(`[server] server is running at http://localhost:${port}`);
});
