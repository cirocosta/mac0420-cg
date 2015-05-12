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
  constructor () {
    super();

    this._viewMatrix = mat4.create();
    this._modelViewMatrix = mat4.create();
    // projection is set by its subclass
    this._projectionMatrix = mat4.create();
    this._pvmMatrix = mat4.create();

    this._inverseViewMatrix = mat4.create();
    this._inverseProjectionMatrix = mat4.create();
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
    if (this._changed_camera_attrs) {
      this.updateView();
      this._changed_camera_attrs = false;
    }

    mat4.multiply(this._modelViewMatrix,
                  this._viewMatrix,
                  modelMatrix);
    mat4.multiply(this._pvmMatrix,
                  this._projectionMatrix,
                  this._modelViewMatrix);

    gl.uniformMatrix4fv(locations.u_MvpMatrix,
                        false,
                        this._pvmMatrix);
  }

  updateView () {
    this._viewMatrix = mat4.lookAt(mat4.create(),
                this.position,
                this.lookAt,
                this.up);
    mat4.transpose(this._viewMatrix, this._viewMatrix);
    mat4.invert(this._inverseViewMatrix, this._viewMatrix);
  }

  getView () {
    return this._viewMatrix;
  }

  getInverseView () {
    return this._inverseViewMatrix;
  }

  getInverseProjection () {
    return this._inverseProjectionMatrix;
  }
};

