"use strict";

import {Keyer} from "../../lib/utils/Keyer";

/**
 * Holds application state in general, like the
 * current mode, etc
 */

let _state = {
  // queue of generated objects to be consumed
  objGeometries: [],
  // caching external resources
  objExternalFiles: {},
  appState: {
    WORLD: 1,
    SELECT: 0,
    EDIT: 0,
    ROTATE: 0,
    TRANSLATE: 0,
    SCALE: 0,
    KILL: 0,
    selectedObj: null
  }
};

/**
 * Notification system
 */
let _notify = {
  objGeometries: [],
  appState: [],
};

/**
 * Helper methods. This is exported to those who
 * want to access the internal state which
 * remains untouchable by the module system
 * (in <3 with closures)
 */
let Store = {
  Keyer: Keyer,
  isKeyActive: Keyer.isKeyActive,
  isButtonActive: Keyer.isButtonActive,

  pushBack (key, data) {
    if (!_state[key])
      throw new Error('Tried to push to ' + key + ' which doesnt exists');

    _state[key].push(data);
    Store.notify(key);
  },

  isEditting () {
    let appState = _state.appState;

    if (appState.EDIT || appState.SCALE ||
        appState.TRANSLATE || appState.ROTATE || appState.KILL)
      return true;
    return false;
  },

  updateAppState (actualState) {
    for (let state in _state.appState) {
      _state.appState[state] = 0;
    }

    _state.appState[actualState] = 1;
    Store.notify('appState');
  },

  update (key, entryKey, entryValue) {
    if (!_state[key])
      throw new Error('Tried to update ' + key + ' which doesnt exists');

    _state[key][entryKey] = entryValue;
  },

  // for retrieving from dict-like objs
  retrieve (key) {
    if (_state[key])
      return _state[key];
    return false;
  },

  // for consuming queue-like objs
  consume (key) {
    if (_state[key].length > 0)
      return _state[key].shift();
    return false;
  },

  notify (key) {
    if (_notify[key] && _notify[key].length) {
      for (let i in _notify[key])
        _notify[key][i]();
    }
  },

  listenTo (key, fun) {
    _notify[key] && _notify[key].push(fun);
  },
};

export default {Store};
