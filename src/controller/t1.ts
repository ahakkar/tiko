import {Request, Response} from 'express';
import path from 'path';
import {promises as fsPromises} from 'fs';
import {StatusCode} from '../constants/statusCodes';
import {WorkSiteType} from '../constants/workSiteTypes';

export const render = async (_req: Request, res: Response) => {
  console.log('mikä jumittaa');
  const filePath = path.join(__dirname, '..', 'view', 'par', 't1.htm');

  try {
    const html = await fsPromises.readFile(filePath, 'utf8');
    const workSiteDropDown = generateWorkSites();
    const modifiedHtml = html.replace(
      '<!-- WorkSite Placeholder -->',
      workSiteDropDown
    );
    res.send(modifiedHtml);
  } catch (err) {
    console.error(`Error reading file: ${filePath}`, err);
    res.status(StatusCode.NotFound).send('Page not found');
  }
};

export const handlePost = async (req: Request, res: Response) => {
  const {address, worksite_type} = req.body;
  res.send(
    `<div>Työkohde tyyppiä ${worksite_type} on lisätty osoitteeseen ${address}.</div>`
  );
};

function generateWorkSites(): string {
  // populate the dropdown with work sites from WorkSiteTypes
  let dd = '<select name="worksite_type" id="workSiteDropdown">';
  Object.values(WorkSiteType).forEach(workSite => {
    dd += `<option value="${workSite}">${workSite}</option>`;
  });
  dd += '</select>';
  return dd;
}
