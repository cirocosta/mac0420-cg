"use strict";

import {Body} from "./Body";
import {AABB} from "./AABB";
import {vec3} from "gl-matrix";

/**
 * Ties Geometry and Material with the idea of
 * a body in space which might also be
 * intercepted by rays, moved, etc.
 *
 * Merges buffers from both geometry and material
 * to send them to the shaders to draw.
 */
export class Inhabitant extends Body {
  constructor (geometry, material) {
    super();

    this.geometry = geometry;
    this.material = material;
    this._aabb = new AABB(geometry._vecMin, geometry._vecMax, this);
  }

  /**
   * Prepares the appropriate buffers and then
   * dispatch them to the gpu to render.
   *
   * @param {GL} gl glcontext
   * @param {Object} locations pointer locations
   *                 to shader attributes/unifs
   */
  sendMatrices (gl, locations) {
    // prepare buffers from body: ModelMatrix
    this._sendBodyMatrices(gl, locations);
    this.geometry._prepareBuffers(gl, locations);
    // this.material._prepareBuffers(gl, locations, this.geometry);
  }

  draw (gl) {
    this.geometry.draw(gl);
  }

  /**
   * Method to be called to determine whether the
   * ray generating intercepts or not the mesh.
   *
   * If a line intersects a plane, then there'll
   * be a point that will make the equation that
   * makes the line and the plane equal to exist.
   *
   * the problem is then reduced to solving for t
   * a matrix equality for each plane in the
   * bounding box.
   */

  intersect (ray, camera) {
    return this._aabb.lineIntersect(ray._start, ray._end, camera);
  }
};

