/**
 * Holds application state in general, like the
 * current mode, etc
 */

let _state = {
  objGeometries: []
};

let _notify = {
  objGeometries: []
};

let Store = {
  update (key, data) {
    if (!_state[key])
      throw new Error('Tried to update ' + key + ' which doesnt exists');

    _state[key].push(data);
    Store.notify(key);
  },

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
