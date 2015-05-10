import {Body} from "./Body";

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
    this._prepareBuffers(gl, locations);
    // this.material._prepareBuffers(gl, locations);
    this.geometry._prepareBuffers(gl, locations);
  }

  draw (gl) {
    let N = this.geometry.getNumberOfDraws();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N);
  }

  /**
   * Method to be called to determine whether the
   * ray generating intercepts or not the mesh
   */
  intersect () { }
};
