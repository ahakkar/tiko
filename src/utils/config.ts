import {Express} from 'express';
import {engine} from 'express-handlebars';
import handlebarsHelpers from './handlebarsHelpers';

/**
 * Konfiguroi Express-sovellusta käyttämään Handlebarsia näkymien generointiin.
 *
 * Näkymien tiedostopääte asetetaan .hbs ja näkymien oletuskansio
 * asetetaan /views.
 *
 * Oletuksena näkymäkansiossa on layouts/main.hbs -tiedosto, joka toimii
 * pohjana kaikille näkymille, ja osanäkymät sijaitsevat kansiossa ./partials.
 *
 * @param app Express-ohjelma
 */
export const configHandlebars = (app: Express) => {
  app.engine(
    'hbs',
    engine({
      extname: 'hbs',
      helpers: handlebarsHelpers,
    })
  );
  app.set('view engine', 'hbs');
  app.set('views', `${__dirname}/../views`);
};
