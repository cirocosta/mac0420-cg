"use strict";

import {Geometry} from "./Geometry";

export class Line extends Geometry {
  /**
   * @param vec3 start
   * @param vec3 end
   */
  constructor (start, end) {
    super({
      vertices_num: 2,
      vertices: new Float32Array([...start, ...end]),
    });
  }

  draw (gl) {
    gl.drawArrays(gl.LINES, 0, 2);
  }
};
