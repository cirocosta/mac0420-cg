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

  const FACES_TYPES = {
    FACE: 'FACE',
    FACE_TEXTURE: 'FACE_TEXTURE',
    FACE_TEXTURE_NORMALS: 'FACE_TEXTURE_NORMALS',
    FACE_NORMALS: 'FACE_NORMALS'
  };

  /**
   * Parses .obj and returns a representation of
   * that.
   * @param  {string} text .obj source
   * @param {bool} convert_quads if the parser
   * should include quad_to_triangle conversion.
   * @return {Object}
   */
  function parse (text) {
    let result = {
      new: true,
      scale: 0.0,
      center_of_mass: [0.0, 0.0, 0.0],

      vertices_normals: [], // indices to obtain 'normals' prop
      vertices_coords: [],  // coordinates that are references to actual vertices

      vertices: [], normals: [], indices: [], // final buffer data
    };

    let bigger_vertex_dist = 0.0;
    let index_hashes = {};
    let index = 0;
    let normal_index = 1;
    let facesType = null;

    text.split('\n').forEach((line) => {
      let match = line.match(/^(v|#|vn|vt|f)\s+/);

      if (!match)
        return;

      switch (match[1]) {
        case 'v':
          let [x, y, z] = line.split(' ').slice(1).map(to_float);
          let dist = x*x + y*y + z*z;

          result.center_of_mass[0] += x;
          result.center_of_mass[1] += y;
          result.center_of_mass[2] += z;

          if (dist > bigger_vertex_dist)
            bigger_vertex_dist = dist

          result.vertices_coords.push(x, y, z);
          break;

        case 'vn':
          result.vertices_normals.push(...(line.split(' ').slice(1).map(to_float)));
          break;

        case 'f':
          let faces = line.split(' ').slice(1);

          if (!facesType) {
            if (~faces[0].indexOf('//'))
              facesType = FACES_TYPES.FACE_NORMALS;
            else if (faces[0].match(/\d+\/\d+\/\d+/))
              facesType = FACES_TYPES.FACE_TEXTURE_NORMALS;
            else
              facesType = FACES_TYPES.FACE;
          }

          if (faces.length === 4) {
            if (facesType === FACES_TYPES.FACE)
              throw new Error('TODO: FACES_TYPE.FACE w/ quad obj');
            faces = [faces[0], faces[1], faces[2], faces[2], faces[3], faces[0]];
          }
          else if (faces.length > 4)
            throw new Error('can\'t deal with ' + faces.length + 'd faces');

          // if no normals info, fix it
          if (facesType === FACES_TYPES.FACE) {
            let facesI = faces.map(to_int_minus_1);

            let v0 = [result.vertices_coords[facesI[0]*3+0],
                      result.vertices_coords[facesI[0]*3+1],
                      result.vertices_coords[facesI[0]*3+2]];
            let v1 = [result.vertices_coords[facesI[1]*3+0],
                      result.vertices_coords[facesI[1]*3+1],
                      result.vertices_coords[facesI[1]*3+2]];
            let v2 = [result.vertices_coords[facesI[2]*3+0],
                      result.vertices_coords[facesI[2]*3+1],
                      result.vertices_coords[facesI[2]*3+2]];

            // calculate the normal of the current face
            let face_normal = getNormal(v0, v1, v2);
            let found_index = -1;

            // see if we have previously added a
            // normal that is the same of this.
            for (let i = 0; i < result.vertices_normals.length; i+=3) {
              if (result.vertices_normals[i+0] === face_normal[0] &&
                  result.vertices_normals[i+1] === face_normal[1] &&
                  result.vertices_normals[i+2] === face_normal[2]) {
                found_index = i/3+1;
              }
            }

            // didn't found another normal like
            // that
            if (!~found_index) {
              result.vertices_normals.push(...face_normal);
              found_index = normal_index++;
            }

            faces = faces.map((face) => face + '//' + found_index);
          }

          // face corresponds to a 'v/t/n' grouping
          faces.forEach((face) => {
            if (face in index_hashes)
              return result.indices.push(index_hashes[face]);

            let [faceI, normalI] = face.split('//');
            normalI = (+normalI) - 1;
            faceI = (+faceI) - 1;

            result.vertices.push(result.vertices_coords[faceI*3],
                                 result.vertices_coords[faceI*3+1],
                                 result.vertices_coords[faceI*3+2]);
            result.normals.push(result.vertices_normals[normalI*3],
                                result.vertices_normals[normalI*3+1],
                                result.vertices_normals[normalI*3+2]);

            index_hashes[face] = index;
            result.indices.push(index++);
          });

          break;

        case '#':
        case 'vt':
          break;
      }
    });

    if (result.vertices_coords.length) {
      result.scale = Math.sqrt(3.0)/Math.sqrt(bigger_vertex_dist);
      result.center_of_mass =
        result.center_of_mass.map((elem) => elem/result.vertices_coords.length);
    }

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
   *   - getNormal(a,b,c) = -getNormal(a,c,b).
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

  function applySmoothShading (obj) {
    let N = obj.vertices.length;
    let visited = [];

    for (let i = 0; i < N; i += 3) {
      let indexes = [];

      for (let j = 0; j < N; j+=3) {
        if (obj.vertices[j] === obj.vertices[i] &&
            obj.vertices[j+1] === obj.vertices[i+1] &&
            obj.vertices[j+2] === obj.vertices[i+2]) {
          indexes.push(j);
        }
      }

      let hash = indexes.join(',');

      if (~visited.indexOf(hash))
        continue;

      visited.push(hash);

      let result_normal = indexes.reduce((result, index) => {
        result[0] += obj.normals[index];
        result[1] += obj.normals[index+1];
        result[2] += obj.normals[index+2];

        return result;
      }, [0.0,0.0,0.0]);

      result_normal = (new Vector3(result_normal)).normalize().elements;

      indexes.forEach((index) => {
        obj.normals[index] = result_normal[0];
        obj.normals[index+1] = result_normal[1];
        obj.normals[index+2] = result_normal[2];
      });
    }
  }

  root.ObjParser = {
    parse,
    getNormal,
    FACES_TYPES,
    applySmoothShading,

    to_float,
    slashed_to_array,
    non_null
  };
})(window);
