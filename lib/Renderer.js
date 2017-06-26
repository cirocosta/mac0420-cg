"use strict";

import WebGLUtils from "../assets/webgl-utils";
import vshader from "./shaders/vshader-frag.glsl";
import fshader from "./shaders/fshader-frag.glsl";

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
    this._gl = WebGLUtils.setupWebGL(this.canvas);
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._program = WebGLUtils.Shaders.initFromSrc(
      this._gl, vshader, fshader
    );
    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.enable(this._gl.POLYGON_OFFSET_FILL);
    this._resize =
      WebGLUtils.genResizeFun(this.canvas, this._gl, (w,h, sd) => {
      if (this._camera)
        this._camera.ar = w/h;
    });

    /**
     * Fetch the pointers to attributes/uniforms
     * inside our shaders. Respectively:
     *  - a_SOMETHING: attribute
     *  - u_SOMETHING: uniform
     *  - v_SOMETHING: varying (inside the
     *                 shader)
     */
    this._locations = WebGLUtils.Shaders.getLocations(this._gl, [
      'a_Position', 'a_Normal',
      'u_ModelMatrix', 'u_MvpMatrix', 'u_NormalMatrix',
    ]);

    this.adjustSize();
  }

  /**
   * Adjusts the internal webgl size
   */
  adjustSize () {
    this._resize();
  }

  /**
   * Renders the world from the pov of a camera.
   *
   * @param {World} world the world to be
   *                rendered,
   * @param {Camera} camera that will see the
   *                 world
   */
  render (world, camera) {
    this._camera = camera;
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    for (let inhabitant of world.inhabitants) {
      inhabitant.sendMatrices(this._gl, this._locations);
      camera.sendMatrices(this._gl,
                          this._locations,
                          inhabitant.getModelMatrix());
      inhabitant.draw(this._gl, this._locations);
    }
  }
};

