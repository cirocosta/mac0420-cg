(function (window) {
  'use strict';

  var ELEMS = {
    filename: document.querySelector('#filename'),
    fileinput: document.querySelector('#fileinput')
  };
  var current_file;

  function onFileSubmitted (ev) {
    var file = ev.target.files && ev.target.files[0];

    if (!file)
      console.error('Error while handling file.', file);

    ELEMS.filename.innerHTML = file.name;
    current_file = file;

    var reader = new FileReader();
    reader.onload = function (ev) {
      console.log(ev.target.result);
    };

    reader.readAsText(file);
  }

  ELEMS.fileinput.addEventListener('change', onFileSubmitted);
})(window);
