"use strict";

import {quat, mat4} from "gl-matrix";
import {deg_to_rad} from "./utils";

/**
 * Encapsulates a rigid body that might appear
 * on the screen if filmed in the world.
 *
 * This base class deals with the MODEL and
 * normal transformations to be applied on a
 * geometry
 */
export class Body {
  constructor () {
    this._modelMatrix = mat4.create();
    this._normalMatrix = mat4.create();
    this._inverseModelMatrix = mat4.create();

    // a quaternion holds the current orientation
    this.rotation = quat.create();
    this.scale = [1.0, 1.0, 1.0];
    this.position = [0.0, 0.0, 0.0];

    // for a non-camera, more of a convenience.
    this.lookAt = [0.0, 0.0, -1.0];
    this.up = [0.0, 1.0, 0.0];

    this._changed = false;
    this._changed_camera_attrs = false;
  }

  getModelMatrix () {
    return this._modelMatrix;
  }

  setScale (new_scale) {
    this.scale = new_scale;
    this._changed = true;
  }

  setRotation (axis, deg) {
    let nquat = quat.setAxisAngle(quat.create(), axis, deg_to_rad(deg));

    quat.multiply(this.rotation, nquat, this.rotation);
    this._changed = true;
  }

  setPosition (new_position, force) {
    this.position = new_position;
    this._changed = true;
    this._changed_camera_attrs = true;

    if (force)
      this._updateModel();
  }

  /**
   * Send matrices that represent body mutations
   *
   * @param {GL} gl webgl context
   * @param {Object} locations shadder pointers
   */
  _sendBodyMatrices (gl, locations) {
    if (this._changed) {
      this._updateModel();
      this._updateNormal();
      this._changed = false;
    }

    gl.uniformMatrix4fv(locations.u_ModelMatrix, false, this._modelMatrix);
    // gl.uniformMatrix4fv(locations.u_NormalMatrix, false, this._normalMatrix);
  }

  /**
   * Updates the model matrix, mutating it by
   * the new values of scale, rotation and
   * translation.
   *
   * Updates its inverse as well.
   * (we can optimize this)
   */
  _updateModel () {
    mat4.identity(this._modelMatrix);
    mat4.fromQuat(this._modelMatrix, this.rotation);
    mat4.scale(this._modelMatrix, this._modelMatrix, this.scale);
    mat4.translate(this._modelMatrix, this._modelMatrix, this.position);
    mat4.invert(this._inverseModelMatrix, this._modelMatrix);
  }

  /**
   * Prepares the normal matrix from the current
   * modelMatrix
   */
  _updateNormal() {
    mat4.transpose(this._normalMatrix, this._inverseModelMatrix);
  }
}

