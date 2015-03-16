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

  function parse (text) {
    var result = {vertices: [], comments: [], vertices_normals: [],
      faces: []};

    text.split('\n').forEach(function (line) {
      var match = line.match(/^(v|#|vn|vt|f)\s+/);

      if (!match)
        return;

      switch (match[1]) {
        case 'v':
        result.vertices.push(line.split(' ').slice(1).map(to_float));
        break;

        case 'vn':
        result.vertices_normals.push(line.split(' ').slice(1).map(to_float));
        break;

        // every face is made up of: (vertex, [,
        // texture, normal]), possible being
        // made up of a triangle (3 vertices) or
        // a quad (4 vertices) - actually, a
        // face can contain any finite number of
        // faces.
        case 'f':
        var faces = line.split(' ').slice(1);
        if (faces.length === 3) {
          result.faces.push(faces);
        } else if (faces.length === 4) { // break a quad into triangles
          result.faces.push([faces[0], faces[1], faces[2]]);
          result.faces.push([faces[2], faces[3], faces[0]]);
        } else {
          throw new Error('can\'t deal with ' + faces.length + 'd faces');
        }
        break;

        case '#':
        case 'vt':
        break;
      }
    });

    return result;
  }

  function process_vertices (parsed_obj) {
    // var indices = [];
    var vertices = [];

    parsed_obj.faces.forEach(function (face) {
      face.forEach(function (face_v) {
        vertices.push(parsed_obj.vertices[face_v-1]);
      });
    });

    return vertices;
  }

  root.ObjParser = {
    parse: parse,
    process_vertices: process_vertices
  };
})(window);
