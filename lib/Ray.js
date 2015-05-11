"use strict";

import {vec4} from "gl-matrix";

/**
 * Generates a vec2 ray tat indicates the proper
 * direction of a ray sent from the (x,y) canvas
 * coordinates obtained from mouse interaction.
 */
function generateRay(canvas, camera, evt) {
  let n = viewportToClipping(evt, canvas.width, canvas.height);
  let v = clippingtoView(n, camera);
  let g = viewToGlobal(v, camera);
}

function viewportToClipping(evt, width, height) {
  let x = 2 * (evt.clientX / width) - 1;
  let y = 1 - 2 * (evt.clientY / height);

  return vec4.clone([x, y, 0, 1]);
}

function clippingtoView(c, camera) {
  let inv_proj = camera.getInverseProjection();
  let v = vec4.transformMat4(vec4.create(), c, inv_proj);

  return vec4.scale(v, v, 1/v[3]);
}

function viewToGlobal(v, camera) {
  let inv_view = camera.getInverseView();
  let g = vec4.transformMat4(vec4.create(), v, inv_proj);

  return g;
}

function create_cube (vertices) {
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

  for (let i = 0; i < N,  i++) {
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
      max_z = mesh->vertices[i+2];
  }
  let size = vec3(max_x-min_x, max_y-min_y, max_z-min_z);
  let center = vec3((min_x+max_x)/2, (min_y+max_y)/2, (min_z+max_z)/2);

  return [size, center];
}

export default {
  generateRay,
  prepareBoundingBox,
};


