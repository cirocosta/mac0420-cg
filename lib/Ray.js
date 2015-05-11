"use strict";

import {vec3, vec4} from "gl-matrix";

export class Ray {
  constructor () {
    this._direction = vec4.create();
    this._pb = vec3.create();
    this._pa = vec3.create();
  }

  /**
   * Generates a vec2 ray tat indicates the proper
   * direction of a ray sent from the (x,y) canvas
   * coordinates obtained from mouse interaction.
   */
  generate (canvas, camera, x, y) {
    let n = this.viewportToClipping(x, y, canvas.clientWidth, canvas.clientHeight);
    let v = this.clippingtoView(n, camera);
    let g = this.viewToGlobal(v, camera);

    this._direction = g;
    this._pb = vec3.clone([g[0], g[1], g[2]]);
  }

  viewportToClipping(xo, yo, width, height) {
    let x = 2 * (xo / width) - 1;
    let y = 1 - 2 * (yo / height);

    return vec4.clone([x, y, 0, 1]);
  }

  clippingtoView(c, camera) {
    let inv_proj = camera.getInverseProjection();
    let v = vec4.transformMat4(vec4.create(), c, inv_proj);

    return vec4.scale(v, v, 1/v[3]);
  }

  viewToGlobal(v, camera) {
    let inv_proj = camera.getInverseProjection();
    let inv_view = camera.getInverseView();
    let g = vec4.transformMat4(vec4.create(), v, inv_proj);

    return g;
  }

  /**
   * Tests whether the current ray intersects the
   * plane.
   *
   * plane:
   *  p0 + (p1-p0)u + (p2-p0)v
   * line:
   *  a + (b-a)t
   *
   * @param {vec4} plane Plane represented by
   *                     three vectors
   *                     concatenated in a matrix
   * @param {vec4}
   * @param {vec4}
   *
   * @return {bool}
   */
  intersectsPlane (v0, v1, v2) {
    let a = this._pa;
    let b = this._pb;
    let res = vec3.create();

    let m = mat3.invert(mat3.create(), mat4.clone([
      a[0]-b[0],  v1[0]-v0[0],  v2[0]-v0[0] ,
      a[1]-b[1],  v1[1]-v0[1],  v2[1]-v0[1] ,
      a[2]-b[2],  v1[2]-v0[2],  v2[2]-v0[2] ,
    ]));

    let v = vec3.clone([a[0]-v0[0], a[1]-v0[1], a[2]-v0[2]]);

    vec3.transformMat3(res, v, m);

    if (res[0] <= 1 && res[0] >= 0)
      return true;
    return false;
  }
}

function create_cube (vertices, translation, scale) {
 let VERTICES = new Float32Array([
    // near plane
    -0.5, -0.5, -0.5, 1.0, // left bottom front
     0.5, -0.5, -0.5, 1.0, // right bottom front
     0.5,  0.5, -0.5, 1.0, // right top front
    -0.5,  0.5, -0.5, 1.0, // left top front

    // back plane
    -0.5, -0.5,  0.5, 1.0, // left bottom back
     0.5, -0.5,  0.5, 1.0, // right bottom back
     0.5,  0.5,  0.5, 1.0, // right top back
    -0.5,  0.5,  0.5, 1.0, // left top back
  ]);

  // sharing vertices as we really don't care
  // about the surface of it. We just need to
  // connect these things
  let INDICES = new Float32Array([
      0, 1, 2, 3, // front plane
      4, 5, 6, 7, // back plane
      0, 4, 1, 5, // bottom plane
      2, 6, 3, 7  // top plane
  ]);

  // translate to center
  // scale by the size
  let transf = mat4.translate(mat4.create(), translation);
  mat4.scale(transf, scale);

  return {
    vertices: VERTICES,
    indices: INDICES,
    modelMatrix: transf
  };
}

function prepareBoundingBox(vertices) {
  // analyze max and mins
  // for axis in (x,y,z):
  //    obtain_max_coordinate
  //    obtain_min_coordinate
  //
  // compute the size necessary for the object:
  // for axis in (x,y,z):
  //    size[axis] = max[axis]-min[axis]
  //    center[axis] = (min[axis]+max[axis])/2
  //
  // compute the cube around the object
  // - cube = create_cube(center)
  // - scale_cube(cube, size)
  // - center_on_object(cube, object)

  let min_x, max_x;
  let min_y, max_y;
  let min_z, max_z;
  let N = vertices.length / 3;

  min_x = max_x = vertices[0];
  min_y = max_y = vertices[0+1];
  min_z = max_z = vertices[0+2];

  for (let i = 0; i < N; i++) {
    if (vertices[i] < min_x)
      min_x = vertices[i];
    if (vertices[i] > max_x)
      max_x = vertices[i];
    if (vertices[i+1] < min_y)
      min_y = vertices[i+1];
    if (vertices[i+1] > max_y)
      max_y = vertices[i+1];
    if (vertices[i+2] < min_z)
      min_z = vertices[i+2];
    if (vertices[i+2] > max_z)
      max_z = vertices[i+2];
  }
  let size = vec3(max_x-min_x, max_y-min_y, max_z-min_z);
  let center = vec3((min_x+max_x)/2, (min_y+max_y)/2, (min_z+max_z)/2);

  return [size, center];
}

