import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import {Kayttaja} from '../models/interfaces';

/**
 * Asettaa näkymien muuttujan htmx:n arvoksi true, jos pyyntö tulee HTMX:ltä.
 * Muuttujaa htmx käytetään pohjatiedostossa main.hbs.
 */
export const htmxChecker = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals['htmx'] = req.headers['hx-request'] === 'true';
  next();
};

/**
 * Tarkistaa, että käyttäjä on kirjautunut sisään.
 *
 * Jos käyttäjä ei ole kirjautunut, käyttäjä uudelleenohjataan
 * kirjautumissivulle.
 *
 * Jos käyttäjä on kirjautunut, req.body['loggedUser']-muuttujaan
 * asetetaan käyttäjän nimi.
 */
export const authRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Hae käyttäjä tokenista
    const user = jwt.verify(
      req.cookies['login'],
      process.env['JWT_SECRET']!
    ) as Kayttaja;

    // Tallenna käyttäjä
    res.locals['writeAccess'] = user.rooli === 'write';
    res.locals['loggedUser'] = user.nimi;
    next();
  } catch (e) {
    // console.log(e);
    res.redirect('/kirjaudu');
  }
};
