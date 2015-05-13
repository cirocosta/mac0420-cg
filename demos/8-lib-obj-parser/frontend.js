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
  modeIndicator: document.querySelector(".mode-indicator"),
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

/**
 * This started as something good but now is just
 * a terrible mess. Shame on me [ciro].
 *
 * TODO fix this.
 */
Store.Keyer.bindDown('shift', () => {
  Store.updateAppState('SELECT');
}).bindUp('shift', () => {
  if (!Store.isEditting())
    Store.updateAppState('WORLD');
}).bindDown('x', (evt) => {
  evt.preventDefault();
  if (Store.getTransformState())
    Store.setTransformAxis(0);
  if (Store.isEditting())
    Store.updateAppState('KILL');
}).bindDown('r', () => {
  Store.setTransformState('ROTATE');
  if (Store.isEditting())
    Store.updateAppState('ROTATE');
}).bindDown('s', () => {
  Store.setTransformState('SCALE');
  if (Store.isEditting())
    Store.updateAppState('SCALE');
}).bindDown('y', () => {
  if (Store.getTransformState())
    Store.setTransformAxis(1);
}).bindDown('z', () => {
  if (Store.getTransformState())
    Store.setTransformAxis(2);
}).bindDown('t', () => {
  Store.setTransformState('TRANSLATE');
  if (Store.isEditting())
    Store.updateAppState('TRANSLATE');
}).bindDown('esc', () => {
  if (Store.isEditting())
    Store.updateAppState('WORLD');
    Store.setTransformAxis(-1);
    Store.setTransformState(null);
}).bindMouseDown('left', (evt) => {
  if (!Store.isEditting())
    return;

  Store.Keyer._mouseY = evt.clientY;
}).bindMouseUp('left', (evt) => {
  if (!Store.isEditting())
    return;

  let delta = Store.Keyer._mouseY - evt.clientY;
  Store.notifyMouseDelta(delta);
}).bindMouseDown('right', (evt) => {
}).bindMouseUp('right', (evt) => {
  ELEMS.modeIndicator.className = "mode-indicator world";
  ELEMS.modeIndicator.innerHTML = "WORLD";
}).process(window);

Store.listenTo('appState', () => {
  let states = Store.retrieve('appState');

  if (states.WORLD) {
    ELEMS.modeIndicator.className = "mode-indicator world";
    ELEMS.modeIndicator.innerHTML = "WORLD";
  } else if (states.SELECT) {
    ELEMS.modeIndicator.className = "mode-indicator select";
    ELEMS.modeIndicator.innerHTML = "SELECT";
  } else if (states.EDIT) {
    ELEMS.modeIndicator.className = "mode-indicator edit";
    ELEMS.modeIndicator.innerHTML = "EDIT";
  } else if (states.ROTATE) {
    ELEMS.modeIndicator.className = "mode-indicator edit";
    ELEMS.modeIndicator.innerHTML = "EDIT ROTATION";
  } else if (states.TRANSLATE) {
    ELEMS.modeIndicator.className = "mode-indicator edit";
    ELEMS.modeIndicator.innerHTML = "EDIT TRANSLATION";
  } else if (states.SCALE) {
    ELEMS.modeIndicator.className = "mode-indicator edit";
    ELEMS.modeIndicator.innerHTML = "EDIT SCALE";
  }
});

export default {ELEMS};

