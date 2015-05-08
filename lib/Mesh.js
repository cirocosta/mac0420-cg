import {Body} from "./Body";

/**
 * Ties Geometry and Material with the idea of
 * a body in space which might also be
 * intercepted by rays, moved, etc.
 *
 * Merges buffers from both geometry and material
 * to send them to the shaders to draw.
 */
export class Mesh extends Body {
  constructor (geometry, material) {
    super();

    this.geometry = geometry;
    this.material = material;
  }

  /**
   * Prepare the appropriate buffers and then
   * dispatch them to the gpu to render.
   */
  draw (gl, locations) {
    this._prepareBuffers(gl, locations);
    // this.material._prepareBuffers(gl, locations);
    this.geometry._prepareBuffers(gl, locations);
  }

  /**
   * Method to be called to determine whether the
   * ray generating intercepts or not the mesh
   */
  intersect () { }
};

