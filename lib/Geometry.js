"use strict";

import {ARRAY_BUFFER, ELEMENTS_BUFFER} from "./Constants";

/**
 * Holds geometry data related to an object that
 * will become part of the world.
 *
 * Does not create any kind of buffer as this is
 * done in the renderer.
 */
export class Geometry {
  /**
   * {
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

    this.vertices_size = this.vertices.length / this.vertices_num;

    this.buffers = {
      vertices: null,
      normals: null,
      indices: null
    };
  }

  prepareBuffers (gl, locations) {
    if (!this.buffers.vertices) {
      this.buffers.vertices = gl.createBuffer();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
    gl.vertexAttribPointer(locations.a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locations.a_Position);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};

