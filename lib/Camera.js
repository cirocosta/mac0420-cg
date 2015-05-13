"use strict";

/**
 * It makes sense to set camera as an inherited
 * class from body as it needs:
 *  - positioning (body.position)
 *  - directioning (body.up, body.lookAt)
 *
 * More than this, a camera must also define:
 *  - choosing a type of lens -> the projection
 *  - choose clipping
 *
 * By default:
 *  - directs to -z
 *  - cube of size 2 (orthographic)
 *  - has an identity as its model-view matrix
 */

import {Body} from "./Body";
import {mat4} from "gl-matrix";

export class Camera extends Body {
  constructor (fov, ar, near, far) {
    super();

    this.fov = fov;
    this.ar = ar;
    this.near = near;
    this.far = far;

    this.position = [0.0, 0.0, 1.0];
    this.lookAt = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];

    this._viewMatrix = mat4.create();
    this._modelViewMatrix = mat4.create();
    this._projectionMatrix = mat4.create();
    this._pvmMatrix = mat4.create();
  }

  /**
   * Given a Body, sends to the gpu what it sees,
   * i.e, projected from its perspective.
   *
   * @param gl
   * @param locations
   * @param modelMatrix (from an object)
   */
  sendMatrices (gl, locations, modelMatrix) {
    const deg_to_rad = (deg) => deg*Math.PI/180.0;
    let V = mat4.create();    // view
    let P = mat4.create();    // projection
    let VM = mat4.create();   // model-view
    let PVM = mat4.create();  // model-view-perspective

    mat4.perspective(P, deg_to_rad(this.fov), this.ar,
                        this.near, this.far);

    mat4.lookAt(V, this.position, this.lookAt, this.up);
    mat4.invert(V, V);

    mat4.multiply(VM, V, modelMatrix);
    mat4.multiply(PVM, P, VM);

    gl.uniformMatrix4fv(locations.u_MvpMatrix,
                        false, PVM);

    this._viewMatrix = V;
    this._projectionMatrix = P;
  }

  viewportToClipping (xo, yo, w, h) {
    let x = 2 * (xo / width) - 1;
    let y = 1 - 2 * (yo / height);

    return [x,y];
  }

  getViewMatrix () {
    return this._viewMatrix;
  }

  getProjectionMatrix () {
    return this._projectionMatrix;
  }

  getInverseViewMatrix () {
    return mat4.invert(mat4.create(), this._viewMatrix);
  }

  getInverseProjectionMatrix () {
    return mat4.invert(mat4.create(), this._projectionMatrix);
  }
};

