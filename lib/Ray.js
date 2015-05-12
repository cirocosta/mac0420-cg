"use strict";

import {vec3, vec4} from "gl-matrix";

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

    console.log("raay");
    console.log(n);
    console.log(v);
    console.log(g);

    vec4.scale(this._end, g, camera.far);
    vec4.transformMat4(this._start, g, camera._modelMatrix);
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
    let inv_proj = camera.getInverseProjection();
    let inv_view = camera.getInverseView();
    let g = vec4.transformMat4(vec4.create(), v, inv_proj);

    return g;
  }
}
