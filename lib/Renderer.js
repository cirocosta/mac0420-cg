"use strict";

import WebGLUtils from "../assets/webgl-utils";
import vshader from "./shaders/vshader.glsl";
import fshader from "./shaders/fshader.glsl";

/**
 *  Depending on object's type we must render
 *  in a special way (specifying drawing mode,
 *  for example). So, each type of object must
 *  the specify its type so that we are able to
 *  easily decide in a switch stament.
 *
 *  Another question is regarding rendering
 *  indexed stuff or not (we also need to
 *  segregate these).
 *
 *  ps.: we must also send normals and colors as
 *  well.
 */
export class Renderer {
  constructor (canvas) {
    this.canvas = canvas;
    this.gl = WebGLUtils.setupWebGL(canvas);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.program = WebGLUtils.Shaders.initFromSrc(
      this.gl, vshader, fshader
    );

    this.locations = WebGLUtils.Shaders.getLocations(this.gl, [
      'a_Position',
      // 'a_Normal',
      // 'u_NormalMatrix', 'u_MvpMatrix', 'u_ModelMatrix'
    ]);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  adjustSize (width, height) {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Scans the world and paints what it has to.
   */
  render (world, camera) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    for (let inhabitant of world.inhabitants) {
      inhabitant.draw(this.gl, this.locations);
    }
  }
};
