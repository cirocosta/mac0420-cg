import Body from "./Body";

/**
 * Ties Geometry and Material with the idea of
 * a body in space which might also be
 * intercepted by rays, moved, etc.
 */
export class Mesh extends Body {
  constructor (geometry, material) {
    super();

    this.geometry = geometry;
    this.material = material;
  }

  draw (gl, locations) {
    this.geometry.prepareBuffers(gl, locations);
    // this.material.prepareBuffer();
  }

  /**
   * Method to be called to determine whether the
   * ray generating intercepts or not the mesh
   */
  raycast () { }
};

