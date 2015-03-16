(function (root) {
  var non_null = function (val) {
    return val != null;
  };

  var to_float = function (val) {
    return val == '' ? undefined : parseFloat(val);
  };

  var slashed_to_array = function (val) {
    return val.split('/').map(to_float);
  };

  // TODO: improve this .

  // this is actually very expensive (doing this
  // kind of match). We should actually take a
  // better approach of applying the regex match
  // after the first_letter lookup and then get
  // the match.
  var REGEXES = {
    vertices: /^v\s(-?\d+\.\d+)\s(-?\d+\.\d+)\s(-?\d+\.\d+)?$/,
    comments: /^#(.*)?/,
    vertices_normals: /^vn\s(-?\d+\.\d+)\s(-?\d+\.\d+)\s(-?\d+\.\d+)$/,
    faces: /^f\s(\d+)\s(\d+)\s(\d+)\s(\d+)$/,
    faces2: /^f(\s\d+\/\d+)(\s\d+\/\d+)(\s\d+\/\d+)(\s\d+\/\d+)?$/,
    faces3: /^f(\s\d+\/\d+?\/\d+)(\s\d+\/\d+?\/\d+)(\s\d+\/\d+?\/\d+)(\s\d+\/\d+?\/\d+)?$/,
    faces4: /^f(\s\d+\/(\d+)?\/\d+)(\s\d+\/(\d+)?\/\d+)(\s\d+\/(\d+)?\/\d+)(\s\d+\/(\d+)?\/\d+)?$/,
  };

  function parse (text) {
    var result = {vertices: [], comments: [], vertices_normals: [],
      faces: [], faces2: [], faces3: [], faces4: []};

    text.split('\n').forEach(function (line) {
      for (var reg in REGEXES) {
        var match = line.match(REGEXES[reg]);

        if (!match)
          continue;

        switch (reg) {
          case 'faces2':
          case 'faces3':
          case 'faces4':
            result[reg].push(match.slice(1).filter(non_null).map(slashed_to_array));
            break;
          default:
            result[reg].push(match.slice(1).map(to_float));
        }

        break;
      }
    });

    return result;
  }

  root.ObjParser = {
    parse: parse
  };
})(window);
