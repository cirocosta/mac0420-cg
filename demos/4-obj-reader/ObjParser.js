(function (root) {
  root.ObjParser = {};

  function parse (text) {
    var result = {vertices: [], comments: [], vertices_normals: [], };
    var REGEXES = {
      vertices: /^v\s(-?\d+\.\d+)\s(-?\d+\.\d+)\s(-?\d+\.\d+)?$/,
      comments: /^#(.*)?/,
      vertices_normals: /^vn\s(-?\d+\.\d+)\s(-?\d+\.\d+)\s(-?\d+\.\d+)$/,
    };

    text.split('\n').forEach(function (line) {
      for (var reg in REGEXES) {
        var match = line.match(REGEXES[reg]);

        if (!match)
          continue;

        result[reg].push(match.slice(1).map(function (val) {
          return parseFloat(val);
        }));
        break;
      }
    });

    return result;
  }

  root.ObjParser = {
    parse: parse
  };
})(window);
