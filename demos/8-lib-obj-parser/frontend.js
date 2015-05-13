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
  bGallery: document.querySelector('#b-gallery'),
  fileInput: document.querySelector('#fileinput'),
  gallery: document.querySelector("#ul-gallery"),
};

ELEMS.gallery.addEventListener('click', (ev) => {
  let {url} = ev.target.dataset;
  let obj;
  let geometry;

  if ((obj = Store.retrieve('objExternalFiles')[url])) {
    geometry = new ObjGeometry(obj);
    Store.pushBack('objGeometries', geometry);

    return;
  }

  fetch(url)
    .then(res => res.text())
    .then((txt) => {
      obj = parseObj(txt);
      geometry = new ObjGeometry(obj);

      Store.update('objExternalFiles', url, obj);
      Store.pushBack('objGeometries', geometry);
    });
});


ELEMS.fileInput.addEventListener('change', (ev) => {
  let file = ev.target.files && ev.target.files[0];
  let reader = new FileReader();

  if (!file)
    console.error('Error while handling file.', file);

  reader.onload = (ev) => {
    let obj = parseObj(ev.target.result);
    let geometry = new ObjGeometry(obj);

    Store.pushBack('objGeometries', geometry);
  };

  reader.readAsText(file);
});

ELEMS.bSelect.addEventListener('click', (ev) => {
  ELEMS.fileInput.click();
});

ELEMS.canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

export default {ELEMS};
