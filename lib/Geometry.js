"use strict";

import {ARRAY_BUFFER, ELEMENTS_BUFFER} from "./Constants";

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

