"use strict";

import {Camera} from "./Camera";
import {mat4} from "gl-matrix";

export class PerspectiveCamera extends Camera {
  constructor (fov, ar, near, far) {
    super();

    this.fov = fov;
    this.ar = ar;
    this.near = near;
    this.far = far;

    this.updateProjection(this.ar);
    this.updateInverseProjection(this.ar);

    this.updateView();
  }

  updateProjection (ar) {
    mat4.perspective(this._projectionMatrix, this.fov, ar,
                     this.near, this.far);
  }

  updateInverseProjection (ar) {
    mat4.invert(this._inverseProjectionMatrix, this._projectionMatrix);
  }
};

