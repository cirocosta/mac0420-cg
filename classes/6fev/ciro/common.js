(function (root) {
  root.MV = {
    vec2: (a1 = .0, a2 = .0) => Array.from(arguments),
  };

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

      return ctx;
    },

    setupWebGL (canvas, opt_attribs) {
      // WebGLRenderingContext exposes the
      // principal interface in WebGL which
      // provides special properties and methods
      // to manipulate 3D content.
      if (!window.WebGLRenderingContext)
        throw new Error('No WebGLRenderingContext in window.');

      return this._create3DContext(canvas, opt_attribs);
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
      return this._createShader(gl, gl.VERTEX_SHADER, source);
    },

    _createFragShader (gl, source) {
      return this._createShader(gl, gl.FRAGMENT_SHADER, source);
    },

    initFromElems (gl, vShaderElem, fShaderElem) {
      let vert = this._createVertShader(gl, vShaderElem.text);
      let frag = this._createFragShader(gl, fShaderElem.text);
      let program = gl.createProgram();

      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error('Shader program failed to link: ' +
                        gl.getProgramInfoLog(program));

      return program;
    },

    initFromUrl () {
      return;
    }
  };
})(window);
