/**
 * Takes care of the frontend, like select
 * buttons and any other kind of state indicators
 *
 * ps: must be required before other code
 */

import {Store} from "./Store";
import {parseObj} from "../../lib/ObjParser";
import {ObjGeometry} from "../../lib/ObjGeometry";

const ELEMS = {
  canvas: document.querySelector('canvas'),
  bSelect: document.querySelector('#b-select'),
  bHelp: document.querySelector('#b-help'),
  fileInput: document.querySelector('#fileinput'),
};

ELEMS.fileInput.addEventListener('change', (ev) => {
  let file = ev.target.files && ev.target.files[0];
  let reader = new FileReader();

  if (!file)
    console.error('Error while handling file.', file);

  reader.onload = (ev) => {
    let obj = parseObj(ev.target.result);
    let geometry = new ObjGeometry(obj);

    Store.update('objGeometries', geometry);
  };

  reader.readAsText(file);
});

ELEMS.bSelect.addEventListener('click', (ev) => {
  ELEMS.fileInput.click();
});

export default ELEMS;
