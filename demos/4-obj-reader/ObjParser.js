(function (root) {
  'use strict';

  const non_null = (val) => val != null;
  const to_float = (val) => val == '' ? undefined : parseFloat(val);
  const slashed_to_array = (val) => val.split('/').map(to_float);

  /**
   * Parses .obj and returns a representation of
   * that.
   * @param  {string} text .obj source
   * @return {Object}
   */
  function parse (text) {
    let result = {vertices: [], comments: [], vertices_normals: [], faces: []};

    text.split('\n').forEach((line) => {
      let match = line.match(/^(v|#|vn|vt|f)\s+/);

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
    let vertices = [];

    parsed_obj.faces.forEach((face) => {
      face.forEach((face_v) => {
        vertices.push(parsed_obj.vertices[face_v-1]);
      });
    });

    return vertices;
  }

  root.ObjParser = {
    parse,
    process_vertices,
  };
})(window);
