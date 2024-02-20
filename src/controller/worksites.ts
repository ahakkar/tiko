import {WorkSiteType} from '../constants/workSiteTypes';
import {Router} from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.send('<div>Hello World!</div>');
});

router.post('/', (_req, res) => {
  res.send('<div>Työkohde on lisätty asiakkaalle.</div>');
});

function generateWorkSites(): string {
  // populate the dropdown with work sites from WorkSiteTypes
  let dd = '<select name="worksite_type" id="workSiteDropdown">';
  Object.values(WorkSiteType).forEach(workSite => {
    dd += `<option value="${workSite}">${workSite}</option>`;
  });
  dd += '</select>';
  return dd;
}

export default router;
