import {Request, Response, NextFunction} from 'express';

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
