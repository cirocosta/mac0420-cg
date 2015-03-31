(function (root) {
  'use strict';

  /**
   * Helper functions
   */
  const non_null = (val) => val != null;
  const to_float = (val) => val == '' ? undefined : parseFloat(val);
  const to_int = (val) => val == '' ? undefined : parseInt(val);
  const to_int_minus_1 = (val) => val == '' ? undefined : (parseInt(val)-1);
  const slashed_to_array = (val) => val.split('/').map(to_float);

  /**
   * Parses .obj and returns a representation of
   * that.
   * @param  {string} text .obj source
   * @param {bool} convert_quads if the parser
   * should include quad_to_triangle conversion.
   * @return {Object}
   */
  function parse (text, convert_quads) {
    let result = {
      _new: true, vertices: [], comments: [], vertices_normals: [],
      faces: []
    };

    text.split('\n').forEach((line) => {
      let match = line.match(/^(v|#|vn|vt|f)\s+/);

      if (!match)
        return;

      switch (match[1]) {
        case 'v':
          result.vertices.push(...line.split(' ').slice(1).map(to_float));
          break;

        case 'vn':
          result.vertices_normals.push(...(line.split(' ').slice(1).map(to_float)));
          break;

        case 'f':
          let faces = line.split(' ').slice(1);

          if (!convert_quads || faces.length === 3) {
            result.faces.push(...faces.map(to_int_minus_1));
            break;
          }

          if (faces.length === 4) { // break a quad into triangles
            faces = faces.map(to_int_minus_1);
            result.faces.push(faces[0], faces[1], faces[2]);
            result.faces.push(faces[2], faces[3], faces[0]);
            break;
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

  /**
   * cross(v1,v2) = surface_normal. being
   * 'a','b' and 'c' points that describe a
   * triangle, v1 = b-a, v2 = c-a.
   *
   * Cross:
   *   * ox = (y1 * z2) - (y2 * z1)
   *   * oy = (z1 * x2) - (z2 * x1)
   *   * oz = (x1 * y2) - (x2 * y1)
   *
   * Note that:
   *   getNormal(a,b,c) = -getNormal(a,c,b).
   *
   * @param  {Array} a point
   * @param  {Array} b point
   * @param  {Array} c point
   * @return {Array}   normal vector
   */
  function getNormal (a, b, c) {
    let v1 = b.map((elem, i) => elem - a[i]);
    let v2 = c.map((elem, i) => elem - a[i]);
    let normal = new Float32Array(3);

    normal[0] = (v1[1]*v2[2]) - (v1[2]*v2[1]);
    normal[1] = (v1[2]*v2[0]) - (v1[0]*v2[2]);
    normal[2] = (v1[0]*v2[1]) - (v1[1]*v2[0]);

    return (new Vector3(normal)).normalize().elements;
  }

  /**
   * Given object vertices and faces, calculate
   * the normals array.
   * @param  {Array} vertices (flattened)
   * @param  {Array} faces (triangular form,
   * flattened)
   * @return {Array} (flattened)
   */
  function calculateNormals (vertices, faces) {
    let normals = [];

    for (let i = 0, N = faces.length; i < N; i+=3) {
      let a = [vertices[(faces[i]-1)*3],
               vertices[((faces[i]-1)*3)+1],
               vertices[((faces[i]-1)*3)+2]];
      let b = [vertices[(faces[i+1]-1)*3],
               vertices[((faces[i+1]-1)*3)+1],
               vertices[((faces[i+1]-1)*3)+2]];
      let c = [vertices[(faces[i+2]-1)*3],
               vertices[((faces[i+2]-1)*3)+1],
               vertices[((faces[i+2]-1)*3)+2]];

      normals.push(...getNormal(a, b, c));
    }

    return normals;
  }

  root.ObjParser = {
    parse,
    calculateNormals,
    getNormal,

    to_float,
    slashed_to_array,
    non_null
  };
})(window);
