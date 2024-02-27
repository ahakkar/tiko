import express from 'express';
import morgan from 'morgan';
import * as config from './utils/config';
import * as middleware from './utils/middleware';
import asiakkaat from './controllers/asiakkaat';
import tarvikkeet from './controllers/tarvikkeet';
import tyosuoritukset from './controllers/tyosuoritukset';
import tyokohteet from './controllers/tyokohteet';

const app = express();
config.configHandlebars(app);

// Middlewaret
app.use(morgan('tiny')); // Logger
app.use(express.urlencoded({extended: true})); // Parse POST data
app.use(middleware.htmxChecker);

// Routerit
app.use('/asiakkaat', asiakkaat);
app.use('/tarvikkeet', tarvikkeet);
app.use('/tyosuoritukset', tyosuoritukset);
app.use('/tyokohteet', tyokohteet);
app.get('/', (_req, res) => res.redirect('/tyosuoritukset'));

// Staattiset tiedostot
app.use('/', express.static('public'));

export default app;
