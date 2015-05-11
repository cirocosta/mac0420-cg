"use strict";

import {ARRAY_BUFFER, ELEMENTS_BUFFER} from "./Constants";
import {vec3} from "gl-matrix";

/**
 * Holds geometry data related to an object that
 * will become part of the world.
 */
export class Geometry {
  /**
   * {
   *  - vertices_num: number
   *  - vertices : Float32Array
   *  - indices : Float32Array
   *  - normals : Float32Array
   *  - type : CONSTANT
   * }
   */
  constructor (data) {
    this.vertices_num = data.vertices_num;
    this.vertices = data.vertices;
    this.indices = data.indices;
    this.normals = data.normals;
    this.type = data.type;

    this.vertices_components_num = this.vertices.length / this.vertices_num;

    this.buffers = {
      vertices: null,
      normals: null,
      indices: null
    };
  }

  destruct (gl) {
    for (buffer of this.buffers) {
      if (buffer)
        gl.deleteBuffer(buffer);
    }
  }

  getBoundingBox () {
    let vertices = this.vertices;
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

    let size = vec3.clone([max_x-min_x, max_y-min_y, max_z-min_z]);
    let center = vec3.clone([(min_x+max_x)/2, (min_y+max_y)/2, (min_z+max_z)/2]);

    return [size, center];
  }

  _prepareBuffers (gl, locations) {
    // caching of the buffer object
    if (!this.buffers.vertices) {
      this.buffers.vertices = gl.createBuffer();

      if (!this.buffers.vertices)
        throw new Error("Error while creating buffer.");
    }

    // bind the actual buffer to our vertices,
    // sending the data and finishing with a draw
    // call.

    // bind the buffer object to a target
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
    // assign the buffer to a given attribute
    gl.vertexAttribPointer(locations.a_Position, this.vertices_components_num,
                           gl.FLOAT, false, 0, 0);
    // enable the assignment
    gl.enableVertexAttribArray(locations.a_Position);
    // write data to the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  getNumberOfDraws () {
    return this.vertices_num;
  }
};

