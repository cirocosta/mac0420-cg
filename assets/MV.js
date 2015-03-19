/**
 * PS.: a few functions (like multiply) were
 * taken from glMatrix (http://glmatrix.net/).
 *
 * As i'd like to implement most of the things
 * my decision was to just grab the most basic
 * from it (like multiplication and transpose
 * operations).
 *
 * Note that in a production scenario glMatrix
 * is much better than this (it's optimized for
 * webgl and contains much more tests).
 */

(function (root) {
  'use strict';

  const deg_to_rad = (deg) => deg*(Math.PI/180.0);
  const rad_to_deg = (rad) => rad*(180.0/Math.PI);

  /**
   * GLSL-a-like vector constructors.
   */
  const vec2 = (a1=.0,a2=.0)=>
    new Float32Array(Array.from(arguments));
  const vec3 = (a1=.0,a2=.0,a3=.0)=>
    new Float32Array(Array.from(arguments));
  const vec4 = (a1=.0,a2=.0,a3=.0,a4=.0)=>
    new Float32Array(Array.from(arguments));

  /**
   * Make a nested array flat.
   * @param  {Array<Array>} arr
   * @return {Array}
   */
  let flatten = ([first, ...rest]) => {
    if (first === undefined)
      return [];
    else if (!Array.isArray(first))
      return [first, ...flatten(rest)];
    else
      return [...flatten(first), ...flatten(rest)];
  };

  /**
   * Flattens an array and transforms it in a
   * type array (Float32Array)
   * @param  {Array<Array>} arr
   * @return {Float32Array}
   */
  const flatten32f = (arr) => new Float32Array(flatten(arr));

  /**
   * Bissects an array given an 's'
   * (0 <= S <= 1)
   *
   * @param  {Array} u
   * @param  {Array} v
   * @param  {number} s
   * @return {Array}
   */
  const bisect = (u, v, s) =>
    u.map((val, i) => (s*val + (1.0-s) * v[i]));

  const _generate = (d) => new Float32Array(d*d);

  const mat4 = {
    scale: _scale,
    rotate: _rotate,
    translate: _translate,
    transpose: _transpose,
    multiply: _multiply.bind(null, 4),
    identity: _identity.bind(null, 4),
    generate: _generate.bind(null, 4),
  };

  /**
   * Scaling is just a matter of performing a
   * multiplication over a diagonal matrix of a
   * given lambda parameter.
   *
   * ps: (A * DIAG(LAMBDA) = lambda*(A)).
   *
   * x 0 0 0
   * 0 y 0 0
   * 0 0 z 0
   * 0 0 0 1
   */
  function _scale (m, x=1., y=1., z=1.) {
    let scale_matrix = [
      x, 0., 0., 0.,
      0., y, 0., 0.,
      0., 0., z, 0.,
      0., 0., 0., 1.
    ];

    return mat4.multiply(scale_matrix, m);
  }

  function _transpose (m, a) {
    // If we are transposing ourselves we can skip
    // a few steps but have to cache some values
    if (m === a) {
        let a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        m[1] = a[4];
        m[2] = a[8];
        m[3] = a[12];
        m[4] = a01;
        m[6] = a[9];
        m[7] = a[13];
        m[8] = a02;
        m[9] = a12;
        m[11] = a[14];
        m[12] = a03;
        m[13] = a13;
        m[14] = a23;
    } else {
        m[0] = a[0];
        m[1] = a[4];
        m[2] = a[8];
        m[3] = a[12];
        m[4] = a[1];
        m[5] = a[5];
        m[6] = a[9];
        m[7] = a[13];
        m[8] = a[2];
        m[9] = a[6];
        m[10] = a[10];
        m[11] = a[14];
        m[12] = a[3];
        m[13] = a[7];
        m[14] = a[11];
        m[15] = a[15];
    }

    return m;
  }

  /**
   * Rotation is performed by the multiplication
   * of the rotation matrix by the colum vector
   * matrix that represents a given point.
   *
   * Euler's rotation theorem:
   * "Any displacement of a rigid body such that
   * a point on the rigid body remains fixed is
   * equivalent to a single rotation about some
   * axis that runs through the fixed point."
   *
   *
   * In the case of more than 2 dimensions,
   * there's the need of specifying what axis is
   * made constant during the rotation.
   *root.MV
   * General rotation:
   *   R = R_z(alpha)*R_z(beta)*R_x(gamma)
   *
   * "Any orientation can be achieved by composing
   * three elemental rotations"
   */
  function _rotate (m, radian, axis) {
    let rotate_matrix;
    let cos = Math.cos(radian);
    let sin = Math.sin(radian);

    switch (axis) {
      case 'x':
        rotate_matrix = [
          1., 0., 0., 0.,
          0., cos, -sin, 0.,
          0., sin, cos, 0.,
          0., 0., 0., 1.
        ];
        break;
      case 'y':
        rotate_matrix = [
          cos, 0., sin, 0.,
          0., 1., 0., 0.,
          -sin, 0, cos, 0.,
          0., 0., 0., 1.,
        ];
        break;
      case 'z':
        rotate_matrix = [
          cos, -sin, 0., 0.,
          sin, cos, 0., 0.,
          0., 0., 1., 0.,
          0., 0., 0., 1.,
        ];
        break;
      default:
        throw new Error('invalid axis. (x|y|z)');
    }

    return mat4.multiply(rotate_matrix, m);
  }

  /**
   * Translating is just an additive operation,
   * which is also representable as a matrix
   * multiplication. By making it a
   * multiplication operation we are able to
   * cumulate things
   *
   * 1 0 0 X
   * 0 1 0 y
   * 0 0 1 Z
   * 0 0 0 1
   * @param  {[type]} d [description]
   * @param  {[type]} m [description]
   * @return {[type]}   [description]
   */
  function _translate (m, tx=0., ty=0., tz=0.) {
    let translate_matrix = [
      1., .0, .0, tx,
      .0, 1., .0, ty,
      .0, .0, 1., tz,
      .0, .0, .0, 1.,
    ];

    return mat4.multiply(translate_matrix, m);
  }

  /**
   * Matrix multiplication
   * @param  {number} d dimension
   * @param  {mat[d]} m
   * @param  {mat[d]} a
   * @param  {mat[d]} b
   * @return {mat[d]}
   */
  function _multiply (d, b, a) {
    let m = _generate(d);

    switch (d) {
      case 2:
        m[0] = a[0] * b[0] + a[1] * b[2];
        m[1] = a[0] * b[1] + a[1] * b[3];
        m[2] = a[2] * b[0] + a[3] * b[2];
        m[3] = a[2] * b[1] + a[3] * b[3];

        return m;
      case 3:
        m[0] = b[0] * a[0] + b[1] * a[3] + b[2] * a[6];
        m[1] = b[0] * a[1] + b[1] * a[4] + b[2] * a[7];
        m[2] = b[0] * a[2] + b[1] * a[5] + b[2] * a[8];

        m[3] = b[3] * a[0] + b[4] * a[3] + b[5] * a[6];
        m[4] = b[3] * a[1] + b[4] * a[4] + b[5] * a[7];
        m[5] = b[3] * a[2] + b[4] * a[5] + b[5] * a[8];

        m[6] = b[6] * a[0] + b[7] * a[3] + b[8] * a[6];
        m[7] = b[6] * a[1] + b[7] * a[4] + b[8] * a[7];
        m[8] = b[6] * a[2] + b[7] * a[5] + b[8] * a[8];

        return m;
      case 4:
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];

        m[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        m[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        m[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        m[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return m;
      default:
        throw new Error('No multiply for dimension ' + d);
    }
  }

  /**
   * Generates a new identity matrix
   * @param  {number} d dimension
   * @return {mat[d]}   matrix of d dimension
   */
  function _identity (d) {
    switch (d) {
      case 2:
      return new Float32Array([
        1,0,
        0,1
      ]);
      case 3:
      return new Float32Array([
        1,0,0,
        0,1,0,
        0,0,1
      ]);
      case 4:
      return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1,
      ]);
      default:
        throw new Error('No identity for dimension ' + d);
    }
  }

  root.MV = {
    mat4,
    bisect,
    flatten,
    flatten32f,
    deg_to_rad,
    rad_to_deg
  };
})(window);
