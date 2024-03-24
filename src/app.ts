import 'express-async-errors';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import * as config from './utils/config';
import * as middleware from './utils/middleware';
import asiakkaat from './controllers/asiakasController';
import laskut from './controllers/laskutController';
import tarvikkeet from './controllers/tarvikkeetController';
import tyosopimukset from './controllers/tyosopimukset/tyosopimusController';
import tyokohteet from './controllers/tyokohdeController';
import toimittajat from './controllers/toimittajaController';
import kirjaudu from './controllers/kirjauduController';
import kirjauduUlos from './controllers/kirjauduUlosController';

const app = express();
config.configHandlebars(app);

// Staattiset tiedostot
app.use('/', express.static('public'));

// Middlewaret
app.use(morgan('dev')); // Logger
app.use(express.urlencoded({extended: true})); // Parse POST data
app.use(cookieParser());
app.use(middleware.htmxChecker);

// Kirjautuminen
app.use('/kirjaudu', kirjaudu);
app.use('/kirjaudu-ulos', kirjauduUlos);
app.use(middleware.authRedirect);
app.use(middleware.unauthorizedCheck);

// Routerit
app.use('/asiakkaat', asiakkaat);
app.use('/laskut', laskut);
app.use('/tarvikkeet', tarvikkeet);
app.use('/tyosopimukset', tyosopimukset);
app.use('/tyokohteet', tyokohteet);
app.use('/toimittajat', toimittajat);
app.get('/tyhja', (_req, res) => res.status(200).send());
app.get('/', (_req, res) => res.redirect('/tyosopimukset'));

export default app;
