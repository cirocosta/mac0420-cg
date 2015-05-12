"use strict";

import {vec3, vec4, mat4} from "gl-matrix";

export class Ray {
  constructor () {
    this._start = vec3.create();
    this._end = vec3.create();
  }

  /**
   * Generates a vec3 ray tat indicates the proper
   * direction of a ray sent from the (x,y) canvas
   * coordinates obtained from mouse interaction.
   *
   * The ray is given in the WORLD reference
   * system.
   */
  generate (canvas, camera, x, y) {
    let n = this.viewportToClipping(x, y, canvas.clientWidth,
                                    canvas.clientHeight);
    let v = this.clippingtoView(n, camera);
    let g = this.viewToGlobal(v, camera);
    let r = vec3.sub(vec3.create(), g, camera.position);

    // camera.position + r * near
    this._start = vec3.add(vec3.create(), camera.position,
                         vec3.scale(vec3.create(), r, camera.near));
    // camera.position + r * far
    this._end = vec3.add(vec3.create(), camera.position,
                         vec3.scale(vec3.create(), r, camera.far));
  }

  viewportToClipping(xo, yo, width, height) {
    let x = 2 * (xo / width) - 1;
    let y = 1 - 2 * (yo / height);

    return vec4.clone([x, y, 0, 1]);
  }

  clippingtoView(c, camera) {
    let inv_proj = camera.getInverseProjection();
    let v = vec4.transformMat4(vec4.create(), c, inv_proj);

    return vec4.scale(v, v, 1/v[3]);
  }

  viewToGlobal(v, camera) {
    let inv_view = camera.getInverseView();
    let g = vec4.transformMat4(vec4.create(), v, inv_view);

    return vec4.transformMat4(vec4.create(), v, camera._inverseModelMatrix);
  }
}
