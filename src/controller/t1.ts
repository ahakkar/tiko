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
  console.log(req.body);
  const {name, address} = req.body;
  console.log(`Vastaanotettu T1 tiedoilla: ${name}, ${address}`);
  res.send(`<div>Työkohde ${address} on lisätty kohteelle ${name}.</div>`);
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
