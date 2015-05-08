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
  /**
   * Constructs a new renderer given a canvas.
   */
  constructor (canvas) {
    this.canvas = canvas;
    this._gl = WebGLUtils.setupWebGL(canvas);
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._program = WebGLUtils.Shaders.initFromSrc(
      this._gl, vshader, fshader
    );

    /**
     * Fetch the pointers to attributes/uniforms
     * inside our shaders. Respectively:
     *  - a_SOMETHING: attribute
     *  - u_SOMETHING: uniform
     *  - v_SOMETHING: varying (inside the
     *                 shader)
     */
    this._locations = WebGLUtils.Shaders.getLocations(this._gl, [
      'a_Position',
      'u_ModelMatrix',
      // 'a_Normal',
      // 'u_NormalMatrix', 'u_MvpMatrix', 'u_ModelMatrix'
    ]);

    this._gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Adjusts the internal webgl size
   */
  adjustSize (width, height) {
    this._gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Scans the world and paints what it has to.
   */
  render (world, camera) {
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    for (let inhabitant of world.inhabitants) {
      inhabitant.draw(this._gl, this._locations);
    }
  }
};
