(function (root) {
  'use strict';

  /**
   * Setup utilities for WebGL
   * @type {Object}
   */
  root.WebGLUtils = {
    _create3DContext (canvas, opt_attribs) {
      let names = ["webgl", "experimental-webgl", "webkit-3d",
                   "moz-webgl"];
      let ctx;

      // try all the different names associated
      // with the retrieval of the 3d context from
      // the various browser implementors.
      for (let i of names) {
        try {ctx = canvas.getContext(i, opt_attribs);}
        catch (e) {}

        if (ctx)
          break;
      }

      if (!ctx)
        throw new Error('GL instance coudl\'t be set.');

      return ctx;
    },

    genResizeFun: (canvas) => (ev) => {
      let {clientWidth, clientHeight} = canvas;

      if (canvas.width !== clientWidth || canvas.height !== clientHeight)
        (canvas.width = clientWidth, canvas.height = clientHeight);
    },

    /**
     * Prepares the WebGL context.
     * @param  {HTMLElement} canvas
     * @param  {(Object|undefined)} opt_attribs
     * @return {WebGLContext}
     */
    setupWebGL (canvas, opt_attribs) {
      // WebGLRenderingContext exposes the
      // principal interface in WebGL which
      // provides special properties and methods
      // to manipulate 3D content.
      if (!window.WebGLRenderingContext)
        throw new Error('No WebGLRenderingContext in window.');

      let ctx = this._create3DContext(canvas, opt_attribs);
      if (!ctx)
        throw new Error('Couldn\'t retrieve webgl context.');

      return ctx;
    },
  };

  root.Shaders = {
    _createShader (gl, source, type) {
      let shader = gl.createShader(type);

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('Shader failed to compile: ' +
                         gl.getShaderInfoLog(shader));

      return shader;
    },

    _createVertShader (gl, source) {
      return this._createShader(gl, source, gl.VERTEX_SHADER);
    },

    _createFragShader (gl, source) {
      return this._createShader(gl, source, gl.FRAGMENT_SHADER);
    },

    _createProgram (gl, vshader, fshader) {
      let program = gl.createProgram();

      if (!program)
        throw new Error('_createProgram: coult not create program.');

      gl.attachShader(program, vshader);
      gl.attachShader(program, fshader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error('Shader program failed to link: ' +
                        gl.getProgramInfoLog(program));

      return program;
    },

    getAttribs (gl, ...names) {
      return names.map((name) => {
        let location;

        if (name.startsWith('a_'))
          location = gl.getAttribLocation(gl.program, name);
        else if (name.startsWith('u_'))
          location = gl.getUniformLocation(gl.program, name);
        else // enforcing name consistency
          throw new Error('Attrib/Unif/Var must start with u_, a_ or v_');

        if (!~location)
          throw new Error('Failed to retrieve location of ' + name);

        return location;
      });
    },

    initFromSrc (gl, vsrc, fsrc) {
      let v = this._createVertShader(gl, vsrc, gl.VERTEX_SHADER);
      let f = this._createFragShader(gl, fsrc, gl.FRAGMENT_SHADER);
      let program = this._createProgram(gl, v, f);

      gl.useProgram(program);
      gl.program = program;

      if (!program)
        throw new Error('Failed to initialize shaders.');

      return program;
    },

    initFromElems (gl, vElem, fElem) {
      let v = this._createVertShader(gl, vElem.text, gl.VERTEX_SHADER);
      let f = this._createFragShader(gl, fElem.text, gl.FRAGMENT_SHADER);
      let program = this._createProgram(gl, v, f);

      gl.useProgram(program);
      gl.program = program;

      if (!program)
        throw new Error('Failed to initialize shaders.');

      return program;
    },

    initFromUrl () {
      return;
    }
  };

  root.WebGLUtils.Shaders = root.Shaders;
})(window);
