"use strict";

import {ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER} from "./Constants";
import {vec3, mat4} from "gl-matrix";
import {AABB} from "./AABB";

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
   * }
   */
  constructor (data) {
    this.vertices_num = data.vertices_num;
    this.vertices = data.vertices;
    this.indices = data.indices;
    this.normals = data.normals;
    this.vertices_components_num = this.vertices.length / this.vertices_num;

    this._vecMin;
    this._vecMax;

    this.buffers = {
      vertices: null,
      normals: null,
      indices: null
    };

    if (this.indices)
      this.type = ELEMENT_ARRAY_BUFFER;
    else
      this.type = ARRAY_BUFFER;

    this.computeBoundingBox();
  }

  destruct (gl) {
    for (buffer of this.buffers) {
      if (buffer)
        gl.deleteBuffer(buffer);
    }
  }

  /**
   * Vertices are defined in their local space.
   * With the bounding box we'll endup with
   * vectors that lie in the localspace of the
   * object. We actually need to change this to
   * the worldspace if we want to compare it with
   * other stuff (like a ray).
   */
  computeBoundingBox () {
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
    let center = vec3.clone([(min_x+max_x)/2,
                             (min_y+max_y)/2,
                             (min_z+max_z)/2]);
    let min = vec3.clone([min_x, min_y, min_z]);
    let max = vec3.clone([max_x, max_y, max_z]);

    // scale by the size of the object and also
    // center it on the object
    //
    // ps: scale is the scale by which a unit
    // cube would have to be scale to
    let transf = mat4.create();

    // mat4.scale(transf, transf, size);
    // mat4.translate(transf, transf, center);

    // vec3.transformMat4(min, min, transf);
    // vec3.transformMat4(max, max, transf);

    this._vecMin = min;
    this._vecMax = max;
  }

  draw (gl) {
    if (this.type === 'ARRAY_BUFFER')
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, N);
    else
      gl.drawElements(gl.TRIANGLES, this.indices.length,
                      gl.UNSIGNED_BYTE, 0);
  }

  _prepareBuffers (gl, locations) {
    switch (this.type) {
      case 'ARRAY_BUFFER':
        this._prepareArrayBuffer(gl, locations);
        break;
      case 'ELEMENT_ARRAY_BUFFER':
        this._prepareArrayBuffer(gl, locations);
        this._prepareIndicesBuffer(gl, locations);
        break;
    }
  }

  _prepareArrayBuffer (gl, locations) {
    if (!this.buffers.vertices) {
      this.buffers.vertices = gl.createBuffer();

      if (!this.buffers.vertices)
        throw new Error("Error while creating buffer.");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
    gl.vertexAttribPointer(locations.a_Position, this.vertices_components_num,
                           gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locations.a_Position);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
  }

  _prepareIndicesBuffer (gl, locations) {
    if (!this.buffers.indices)
      this.buffers.indices = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices,
                  gl.STATIC_DRAW);
  }

};

