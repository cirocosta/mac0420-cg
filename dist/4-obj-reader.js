/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*************************************!*\
  !*** ./demos/4-obj-reader/index.js ***!
  \*************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireWildcard = __webpack_require__(/*! babel-runtime/helpers/interop-require-wildcard */ 5)['default'];
	
	var _mat4 = __webpack_require__(/*! gl-matrix */ 9);
	
	__webpack_require__(/*! babel/polyfill */ 8);
	
	__webpack_require__(/*! ../../assets/webgl-debug */ 1);
	
	var _WebGLUtils = __webpack_require__(/*! ../../assets/webgl-utils */ 2);
	
	var _WebGLUtils2 = _interopRequireWildcard(_WebGLUtils);
	
	var _ObjParser = __webpack_require__(/*! ./ObjParser.js */ 3);
	
	var _ObjParser2 = _interopRequireWildcard(_ObjParser);
	
	var _rotating = {
	  ROTATE_X: false,
	  ROTATE_Y: false,
	  ROTATE_Z: false
	};
	var _rotations = {
	  ROTATE_X: 45,
	  ROTATE_Y: 45,
	  ROTATE_Z: 0
	};
	
	// commands config
	var _meshGrid = false;
	var _looping = false;
	var _smoothShading = false;
	var _pressed = null;
	var _perspective = true;
	
	var deg_to_rad = function deg_to_rad(deg) {
	  return deg * Math.PI / 180;
	};
	var ELEMS = {
	  canvas: document.querySelector('canvas'),
	
	  fileinput: document.querySelector('.fileupload input'),
	  filebtn: document.querySelector('.fileupload button'),
	  filename: document.querySelector('.fileupload p'),
	  // gallery: document.querySelector('.fileupload-gallery'),
	
	  vshader: document.getElementById('vshader'),
	  fshader: document.getElementById('fshader'),
	
	  vshader_fragment: document.getElementById('vshader-fragment'),
	  fshader_fragment: document.getElementById('fshader-fragment'),
	
	  // rotate: document.querySelector('.command-rotate'),
	  // translate: document.querySelector('.command-translate'),
	  // scale: document.querySelector('.command-scale'),
	
	  rotateX: document.querySelector('.command-rotateX'),
	  rotateY: document.querySelector('.command-rotateY'),
	  rotateZ: document.querySelector('.command-rotateZ'),
	  toggleProjection: document.querySelector('.command-toggleProjection'),
	  toggleRotation: document.querySelector('.command-toggleRotation'),
	  toggleMeshgrid: document.querySelector('.command-toggleMeshgrid'),
	  toggleShading: document.querySelector('.command-toggleShading') };
	
	function triggerRotation(which, flag) {
	  _rotating[which] = flag;
	}
	
	function incRotation(which) {
	  _rotations[which] += 2;
	}
	
	ELEMS.toggleMeshgrid.addEventListener('click', function (ev) {
	  _meshGrid = !_meshGrid;
	});
	
	ELEMS.toggleShading.addEventListener('click', function (ev) {
	  _smoothShading = !_smoothShading;
	  obj && (obj['new'] = true);
	});
	
	ELEMS.toggleProjection.addEventListener('click', function (ev) {
	  _perspective = !_perspective;
	});
	
	ELEMS.toggleRotation.addEventListener('click', function (ev) {
	  triggerRotation('ROTATE_X', _rotating.ROTATE_X = !_rotating.ROTATE_X);
	  triggerRotation('ROTATE_Y', _rotating.ROTATE_Y = !_rotating.ROTATE_Y);
	  triggerRotation('ROTATE_Z', _rotating.ROTATE_Z = !_rotating.ROTATE_Z);
	});
	
	ELEMS.rotateX.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_X', true));
	ELEMS.rotateY.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_Y', true));
	ELEMS.rotateZ.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_Z', true));
	
	ELEMS.rotateX.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_X', false));
	ELEMS.rotateY.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_Y', false));
	ELEMS.rotateZ.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_Z', false));
	
	var current_file = undefined,
	    obj = undefined;
	var VERTICES = undefined,
	    INDICES = undefined,
	    NORMALS = undefined;
	var gl = _WebGLUtils2['default'].setupWebGL(ELEMS.canvas);
	
	var M = _mat4.mat4.create(); // model
	var N = _mat4.mat4.create(); // normal
	var V = _mat4.mat4.create(); // view
	var P = _mat4.mat4.create(); // perspective
	var VM = _mat4.mat4.create(); // model-view
	var PVM = _mat4.mat4.create(); // model-view-perspective
	
	var resize = _WebGLUtils2['default'].genResizeFun(ELEMS.canvas, gl, function (w, h, shouldDraw) {
	  updateProjection(w, h);
	  shouldDraw && draw();
	});
	
	_WebGLUtils2['default'].Shaders.initFromElems(gl, ELEMS.vshader_fragment, ELEMS.fshader_fragment);
	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);
	
	var LOCATIONS = _WebGLUtils2['default'].Shaders.getLocations(gl, ['a_Position', 'a_Normal', 'u_NormalMatrix', 'u_MvpMatrix', 'u_ModelMatrix']);
	
	var NBUFFER = _WebGLUtils2['default'].initBuffer(gl, null, 3, gl.FLOAT, LOCATIONS.a_Normal);
	var VBUFFER = _WebGLUtils2['default'].initBuffer(gl, null, 3, gl.FLOAT, LOCATIONS.a_Position);
	var IBUFFER = _WebGLUtils2['default'].initBuffer(gl, null, null, gl.FLOAT, null, gl.ELEMENT_ARRAY_BUFFER);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	/**
	 * Draws the corresponding OBJ loaded.
	 * @param {Object} obj object obtained from
	 * ObjParser::parse
	 */
	function draw_obj(obj) {
	  if (!obj) {
	    return 0;
	  }if (obj['new']) {
	    // caching
	    VERTICES = new Float32Array(obj.vertices);
	    INDICES = new Uint16Array(obj.indices);
	    if (_smoothShading) NORMALS = new Float32Array(obj.smooth_normals);else NORMALS = new Float32Array(obj.flat_normals);
	
	    obj['new'] = false;
	  }
	
	  _mat4.mat4.scale(M, M, [obj.scale, obj.scale, obj.scale]);
	  _mat4.mat4.rotateX(M, M, deg_to_rad(_rotations.ROTATE_X));
	  _mat4.mat4.rotateY(M, M, deg_to_rad(_rotations.ROTATE_Y));
	  _mat4.mat4.rotateZ(M, M, deg_to_rad(_rotations.ROTATE_Z));
	  _mat4.mat4.translate(M, M, obj.center_of_mass.map(function (el) {
	    return -el;
	  }));
	
	  gl.bindBuffer(gl.ARRAY_BUFFER, VBUFFER);
	  gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
	
	  gl.bindBuffer(gl.ARRAY_BUFFER, NBUFFER);
	  gl.bufferData(gl.ARRAY_BUFFER, NORMALS, gl.STATIC_DRAW);
	
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBUFFER);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);
	
	  return INDICES.length;
	}
	
	function updateProjection(w, h) {
	  var ar = w / h;
	
	  if (_perspective) _mat4.mat4.perspective(P, deg_to_rad(30), ar, 0.1, 50);else _mat4.mat4.ortho(P, -2.5 * ar, 2.5 * ar, -2.5, 2.5, 0.1, 50);
	}
	
	/**
	 * Draws the entire scene.
	 */
	function draw() {
	  _mat4.mat4.identity(M);
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	  updateProjection(ELEMS.canvas.width, ELEMS.canvas.height);
	  _mat4.mat4.lookAt(V, [0, 0, 10], // eye
	  [0, 0, 0], // at
	  [0, 1, 0]); // up
	
	  var N_INDICES = draw_obj(obj);
	
	  _mat4.mat4.multiply(VM, V, M);
	  _mat4.mat4.multiply(PVM, P, VM);
	  _mat4.mat4.invert(N, M);
	  _mat4.mat4.transpose(N, N);
	
	  gl.uniformMatrix4fv(LOCATIONS.u_ModelMatrix, false, M);
	  gl.uniformMatrix4fv(LOCATIONS.u_NormalMatrix, false, N);
	  gl.uniformMatrix4fv(LOCATIONS.u_MvpMatrix, false, PVM);
	
	  // executes the shader and draws the geometric
	  // shape in the specified 'mode' using the
	  // indices specified in the buffer obj bound
	  // to gl.ELEMENT_ARRAY_BUFFER.
	  if (!_meshGrid) gl.drawElements(gl.TRIANGLES, N_INDICES, gl.UNSIGNED_SHORT, 0);else gl.drawElements(gl.LINES, N_INDICES, gl.UNSIGNED_SHORT, 0);
	}
	
	ELEMS.fileinput.addEventListener('change', function (ev) {
	  var file = ev.target.files && ev.target.files[0];
	  var reader = new FileReader();
	
	  if (!file) console.error('Error while handling file.', file);
	
	  ELEMS.filename.hidden = false;
	  ELEMS.filename.innerHTML = file.name;
	  current_file = file;
	
	  reader.onload = function (ev) {
	    obj = _ObjParser2['default'].parse(ev.target.result);
	    resize(false);
	    !_looping && loop();
	  };
	
	  reader.readAsText(file);
	});
	
	window.addEventListener('resize', resize);
	
	ELEMS.filebtn.addEventListener('click', function (ev) {
	  ELEMS.fileinput.click();
	});
	
	function loop() {
	  window.requestAnimationFrame(loop);
	
	  for (var rot in _rotating) {
	    if (_rotating[rot]) incRotation(rot);
	  }draw();
	}
	
	// 'u_LightColor', 'u_AmbientLight', 'u_LightPosition'

/***/ },
/* 1 */
/*!*******************************!*\
  !*** ./assets/webgl-debug.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	//Copyright (c) 2009 The Chromium Authors. All rights reserved.
	//Use of this source code is governed by a BSD-style license that can be
	//found in the LICENSE file.
	
	// Various functions for helping debug WebGL apps.
	
	'use strict';
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)['default'];
	
	var WebGLDebugUtils = (function () {
	
	  /**
	   * Wrapped logging function.
	   * @param {string} msg Message to log.
	   */
	  var log = function log(msg) {
	    if (window.console && window.console.log) {
	      window.console.log(msg);
	    }
	  };
	
	  /**
	   * Which arguements are enums.
	   * @type {!Object.<number, string>}
	   */
	  var glValidEnumContexts = {
	
	    // Generic setters and getters
	
	    enable: { 0: true },
	    disable: { 0: true },
	    getParameter: { 0: true },
	
	    // Rendering
	
	    drawArrays: { 0: true },
	    drawElements: { 0: true, 2: true },
	
	    // Shaders
	
	    createShader: { 0: true },
	    getShaderParameter: { 1: true },
	    getProgramParameter: { 1: true },
	
	    // Vertex attributes
	
	    getVertexAttrib: { 1: true },
	    vertexAttribPointer: { 2: true },
	
	    // Textures
	
	    bindTexture: { 0: true },
	    activeTexture: { 0: true },
	    getTexParameter: { 0: true, 1: true },
	    texParameterf: { 0: true, 1: true },
	    texParameteri: { 0: true, 1: true, 2: true },
	    texImage2D: { 0: true, 2: true, 6: true, 7: true },
	    texSubImage2D: { 0: true, 6: true, 7: true },
	    copyTexImage2D: { 0: true, 2: true },
	    copyTexSubImage2D: { 0: true },
	    generateMipmap: { 0: true },
	
	    // Buffer objects
	
	    bindBuffer: { 0: true },
	    bufferData: { 0: true, 2: true },
	    bufferSubData: { 0: true },
	    getBufferParameter: { 0: true, 1: true },
	
	    // Renderbuffers and framebuffers
	
	    pixelStorei: { 0: true, 1: true },
	    readPixels: { 4: true, 5: true },
	    bindRenderbuffer: { 0: true },
	    bindFramebuffer: { 0: true },
	    checkFramebufferStatus: { 0: true },
	    framebufferRenderbuffer: { 0: true, 1: true, 2: true },
	    framebufferTexture2D: { 0: true, 1: true, 2: true },
	    getFramebufferAttachmentParameter: { 0: true, 1: true, 2: true },
	    getRenderbufferParameter: { 0: true, 1: true },
	    renderbufferStorage: { 0: true, 1: true },
	
	    // Frame buffer operations (clear, blend, depth test, stencil)
	
	    clear: { 0: true },
	    depthFunc: { 0: true },
	    blendFunc: { 0: true, 1: true },
	    blendFuncSeparate: { 0: true, 1: true, 2: true, 3: true },
	    blendEquation: { 0: true },
	    blendEquationSeparate: { 0: true, 1: true },
	    stencilFunc: { 0: true },
	    stencilFuncSeparate: { 0: true, 1: true },
	    stencilMaskSeparate: { 0: true },
	    stencilOp: { 0: true, 1: true, 2: true },
	    stencilOpSeparate: { 0: true, 1: true, 2: true, 3: true },
	
	    // Culling
	
	    cullFace: { 0: true },
	    frontFace: { 0: true } };
	
	  /**
	   * Map of numbers to names.
	   * @type {Object}
	   */
	  var glEnums = null;
	
	  /**
	   * Initializes this module. Safe to call more than once.
	   * @param {!WebGLRenderingContext} ctx A WebGL context. If
	   *    you have more than one context it doesn't matter which one
	   *    you pass in, it is only used to pull out constants.
	   */
	  function init(ctx) {
	    if (glEnums == null) {
	      glEnums = {};
	      for (var propertyName in ctx) {
	        if (typeof ctx[propertyName] == 'number') {
	          glEnums[ctx[propertyName]] = propertyName;
	        }
	      }
	    }
	  }
	
	  /**
	   * Checks the utils have been initialized.
	   */
	  function checkInit() {
	    if (glEnums == null) {
	      throw 'WebGLDebugUtils.init(ctx) not called';
	    }
	  }
	
	  /**
	   * Returns true or false if value matches any WebGL enum
	   * @param {*} value Value to check if it might be an enum.
	   * @return {boolean} True if value matches one of the WebGL defined enums
	   */
	  function mightBeEnum(value) {
	    checkInit();
	    return glEnums[value] !== undefined;
	  }
	
	  /**
	   * Gets an string version of an WebGL enum.
	   *
	   * Example:
	   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
	   *
	   * @param {number} value Value to return an enum for
	   * @return {string} The string version of the enum.
	   */
	  function glEnumToString(value) {
	    checkInit();
	    var name = glEnums[value];
	    return name !== undefined ? name : '*UNKNOWN WebGL ENUM (0x' + value.toString(16) + ')';
	  }
	
	  /**
	   * Returns the string version of a WebGL argument.
	   * Attempts to convert enum arguments to strings.
	   * @param {string} functionName the name of the WebGL function.
	   * @param {number} argumentIndx the index of the argument.
	   * @param {*} value The value of the argument.
	   * @return {string} The value as a string.
	   */
	  function glFunctionArgToString(functionName, argumentIndex, value) {
	    var funcInfo = glValidEnumContexts[functionName];
	    if (funcInfo !== undefined) {
	      if (funcInfo[argumentIndex]) {
	        return glEnumToString(value);
	      }
	    }
	    return value.toString();
	  }
	
	  /**
	   * Given a WebGL context returns a wrapped context that calls
	   * gl.getError after every command and calls a function if the
	   * result is not gl.NO_ERROR.
	   *
	   * @param {!WebGLRenderingContext} ctx The webgl context to
	   *        wrap.
	   * @param {!function(err, funcName, args): void} opt_onErrorFunc
	   *        The function to call when gl.getError returns an
	   *        error. If not specified the default function calls
	   *        console.log with a message.
	   */
	  function makeDebugContext(ctx, opt_onErrorFunc) {
	    init(ctx);
	    opt_onErrorFunc = opt_onErrorFunc || function (err, functionName, args) {
	      // apparently we can't do args.join(",");
	      var argStr = '';
	      for (var ii = 0; ii < args.length; ++ii) {
	        argStr += (ii == 0 ? '' : ', ') + glFunctionArgToString(functionName, ii, args[ii]);
	      }
	      log('WebGL error ' + glEnumToString(err) + ' in ' + functionName + '(' + argStr + ')');
	    };
	
	    // Holds booleans for each GL error so after we get the error ourselves
	    // we can still return it to the client app.
	    var glErrorShadow = {};
	
	    // Makes a function that calls a WebGL function and then calls getError.
	    function makeErrorWrapper(ctx, functionName) {
	      return function () {
	        var result = ctx[functionName].apply(ctx, arguments);
	        var err = ctx.getError();
	        if (err != 0) {
	          glErrorShadow[err] = true;
	          opt_onErrorFunc(err, functionName, arguments);
	        }
	        return result;
	      };
	    }
	
	    // Make a an object that has a copy of every property of the WebGL context
	    // but wraps all functions.
	    var wrapper = {};
	    for (var propertyName in ctx) {
	      if (typeof ctx[propertyName] == 'function') {
	        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
	      } else {
	        wrapper[propertyName] = ctx[propertyName];
	      }
	    }
	
	    // Override the getError function with one that returns our saved results.
	    wrapper.getError = function () {
	      for (var err in glErrorShadow) {
	        if (glErrorShadow[err]) {
	          glErrorShadow[err] = false;
	          return err;
	        }
	      }
	      return ctx.NO_ERROR;
	    };
	
	    return wrapper;
	  }
	
	  function resetToInitialState(ctx) {
	    var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
	    var tmp = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
	    for (var ii = 0; ii < numAttribs; ++ii) {
	      ctx.disableVertexAttribArray(ii);
	      ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
	      ctx.vertexAttrib1f(ii, 0);
	    }
	    ctx.deleteBuffer(tmp);
	
	    var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
	    for (var ii = 0; ii < numTextureUnits; ++ii) {
	      ctx.activeTexture(ctx.TEXTURE0 + ii);
	      ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
	      ctx.bindTexture(ctx.TEXTURE_2D, null);
	    }
	
	    ctx.activeTexture(ctx.TEXTURE0);
	    ctx.useProgram(null);
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
	    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
	    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
	    ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
	    ctx.disable(ctx.BLEND);
	    ctx.disable(ctx.CULL_FACE);
	    ctx.disable(ctx.DEPTH_TEST);
	    ctx.disable(ctx.DITHER);
	    ctx.disable(ctx.SCISSOR_TEST);
	    ctx.blendColor(0, 0, 0, 0);
	    ctx.blendEquation(ctx.FUNC_ADD);
	    ctx.blendFunc(ctx.ONE, ctx.ZERO);
	    ctx.clearColor(0, 0, 0, 0);
	    ctx.clearDepth(1);
	    ctx.clearStencil(-1);
	    ctx.colorMask(true, true, true, true);
	    ctx.cullFace(ctx.BACK);
	    ctx.depthFunc(ctx.LESS);
	    ctx.depthMask(true);
	    ctx.depthRange(0, 1);
	    ctx.frontFace(ctx.CCW);
	    ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
	    ctx.lineWidth(1);
	    ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
	    ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
	    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
	    ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	    // TODO: Delete this IF.
	    if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
	      ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
	    }
	    ctx.polygonOffset(0, 0);
	    ctx.sampleCoverage(1, false);
	    ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
	    ctx.stencilFunc(ctx.ALWAYS, 0, 4294967295);
	    ctx.stencilMask(4294967295);
	    ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
	    ctx.viewport(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
	    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);
	
	    // TODO: This should NOT be needed but Firefox fails with 'hint'
	    while (ctx.getError());
	  }
	
	  function makeLostContextSimulatingContext(ctx) {
	    var wrapper_ = {};
	    var contextId_ = 1;
	    var contextLost_ = false;
	    var resourceId_ = 0;
	    var resourceDb_ = [];
	    var onLost_ = undefined;
	    var onRestored_ = undefined;
	    var nextOnRestored_ = undefined;
	
	    // Holds booleans for each GL error so can simulate errors.
	    var glErrorShadow_ = {};
	
	    function isWebGLObject(obj) {
	      //return false;
	      return obj instanceof WebGLBuffer || obj instanceof WebGLFramebuffer || obj instanceof WebGLProgram || obj instanceof WebGLRenderbuffer || obj instanceof WebGLShader || obj instanceof WebGLTexture;
	    }
	
	    function checkResources(args) {
	      for (var ii = 0; ii < args.length; ++ii) {
	        var arg = args[ii];
	        if (isWebGLObject(arg)) {
	          return arg.__webglDebugContextLostId__ == contextId_;
	        }
	      }
	      return true;
	    }
	
	    function clearErrors() {
	      var k = _core.Object.keys(glErrorShadow_);
	      for (var ii = 0; ii < k.length; ++ii) {
	        delete glErrorShdow_[k];
	      }
	    }
	
	    // Makes a function that simulates WebGL when out of context.
	    function makeLostContextWrapper(ctx, functionName) {
	      var f = ctx[functionName];
	      return function () {
	        // Only call the functions if the context is not lost.
	        if (!contextLost_) {
	          if (!checkResources(arguments)) {
	            glErrorShadow_[ctx.INVALID_OPERATION] = true;
	            return;
	          }
	          var result = f.apply(ctx, arguments);
	          return result;
	        }
	      };
	    }
	
	    for (var propertyName in ctx) {
	      if (typeof ctx[propertyName] == 'function') {
	        wrapper_[propertyName] = makeLostContextWrapper(ctx, propertyName);
	      } else {
	        wrapper_[propertyName] = ctx[propertyName];
	      }
	    }
	
	    function makeWebGLContextEvent(statusMessage) {
	      return { statusMessage: statusMessage };
	    }
	
	    function freeResources() {
	      for (var ii = 0; ii < resourceDb_.length; ++ii) {
	        var resource = resourceDb_[ii];
	        if (resource instanceof WebGLBuffer) {
	          ctx.deleteBuffer(resource);
	        } else if (resource instanceof WebctxFramebuffer) {
	          ctx.deleteFramebuffer(resource);
	        } else if (resource instanceof WebctxProgram) {
	          ctx.deleteProgram(resource);
	        } else if (resource instanceof WebctxRenderbuffer) {
	          ctx.deleteRenderbuffer(resource);
	        } else if (resource instanceof WebctxShader) {
	          ctx.deleteShader(resource);
	        } else if (resource instanceof WebctxTexture) {
	          ctx.deleteTexture(resource);
	        }
	      }
	    }
	
	    wrapper_.loseContext = function () {
	      if (!contextLost_) {
	        contextLost_ = true;
	        ++contextId_;
	        while (ctx.getError());
	        clearErrors();
	        glErrorShadow_[ctx.CONTEXT_LOST_WEBGL] = true;
	        setTimeout(function () {
	          if (onLost_) {
	            onLost_(makeWebGLContextEvent('context lost'));
	          }
	        }, 0);
	      }
	    };
	
	    wrapper_.restoreContext = function () {
	      if (contextLost_) {
	        if (onRestored_) {
	          setTimeout(function () {
	            freeResources();
	            resetToInitialState(ctx);
	            contextLost_ = false;
	            if (onRestored_) {
	              var callback = onRestored_;
	              onRestored_ = nextOnRestored_;
	              nextOnRestored_ = undefined;
	              callback(makeWebGLContextEvent('context restored'));
	            }
	          }, 0);
	        } else {
	          throw 'You can not restore the context without a listener';
	        }
	      }
	    };
	
	    // Wrap a few functions specially.
	    wrapper_.getError = function () {
	      if (!contextLost_) {
	        var err;
	        while (err = ctx.getError()) {
	          glErrorShadow_[err] = true;
	        }
	      }
	      for (var err in glErrorShadow_) {
	        if (glErrorShadow_[err]) {
	          delete glErrorShadow_[err];
	          return err;
	        }
	      }
	      return ctx.NO_ERROR;
	    };
	
	    var creationFunctions = ['createBuffer', 'createFramebuffer', 'createProgram', 'createRenderbuffer', 'createShader', 'createTexture'];
	    for (var ii = 0; ii < creationFunctions.length; ++ii) {
	      var functionName = creationFunctions[ii];
	      wrapper_[functionName] = (function (f) {
	        return function () {
	          if (contextLost_) {
	            return null;
	          }
	          var obj = f.apply(ctx, arguments);
	          obj.__webglDebugContextLostId__ = contextId_;
	          resourceDb_.push(obj);
	          return obj;
	        };
	      })(ctx[functionName]);
	    }
	
	    var functionsThatShouldReturnNull = ['getActiveAttrib', 'getActiveUniform', 'getBufferParameter', 'getContextAttributes', 'getAttachedShaders', 'getFramebufferAttachmentParameter', 'getParameter', 'getProgramParameter', 'getProgramInfoLog', 'getRenderbufferParameter', 'getShaderParameter', 'getShaderInfoLog', 'getShaderSource', 'getTexParameter', 'getUniform', 'getUniformLocation', 'getVertexAttrib'];
	    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
	      var functionName = functionsThatShouldReturnNull[ii];
	      wrapper_[functionName] = (function (f) {
	        return function () {
	          if (contextLost_) {
	            return null;
	          }
	          return f.apply(ctx, arguments);
	        };
	      })(wrapper_[functionName]);
	    }
	
	    var isFunctions = ['isBuffer', 'isEnabled', 'isFramebuffer', 'isProgram', 'isRenderbuffer', 'isShader', 'isTexture'];
	    for (var ii = 0; ii < isFunctions.length; ++ii) {
	      var functionName = isFunctions[ii];
	      wrapper_[functionName] = (function (f) {
	        return function () {
	          if (contextLost_) {
	            return false;
	          }
	          return f.apply(ctx, arguments);
	        };
	      })(wrapper_[functionName]);
	    }
	
	    wrapper_.checkFramebufferStatus = (function (f) {
	      return function () {
	        if (contextLost_) {
	          return ctx.FRAMEBUFFER_UNSUPPORTED;
	        }
	        return f.apply(ctx, arguments);
	      };
	    })(wrapper_.checkFramebufferStatus);
	
	    wrapper_.getAttribLocation = (function (f) {
	      return function () {
	        if (contextLost_) {
	          return -1;
	        }
	        return f.apply(ctx, arguments);
	      };
	    })(wrapper_.getAttribLocation);
	
	    wrapper_.getVertexAttribOffset = (function (f) {
	      return function () {
	        if (contextLost_) {
	          return 0;
	        }
	        return f.apply(ctx, arguments);
	      };
	    })(wrapper_.getVertexAttribOffset);
	
	    wrapper_.isContextLost = function () {
	      return contextLost_;
	    };
	
	    function wrapEvent(listener) {
	      if (typeof listener == 'function') {
	        return listener;
	      } else {
	        return function (info) {
	          listener.handleEvent(info);
	        };
	      }
	    }
	
	    wrapper_.registerOnContextLostListener = function (listener) {
	      onLost_ = wrapEvent(listener);
	    };
	
	    wrapper_.registerOnContextRestoredListener = function (listener) {
	      if (contextLost_) {
	        nextOnRestored_ = wrapEvent(listener);
	      } else {
	        onRestored_ = wrapEvent(listener);
	      }
	    };
	
	    return wrapper_;
	  }
	
	  return {
	    /**
	     * Initializes this module. Safe to call more than once.
	     * @param {!WebGLRenderingContext} ctx A WebGL context. If
	     *    you have more than one context it doesn't matter which one
	     *    you pass in, it is only used to pull out constants.
	     */
	    init: init,
	
	    /**
	     * Returns true or false if value matches any WebGL enum
	     * @param {*} value Value to check if it might be an enum.
	     * @return {boolean} True if value matches one of the WebGL defined enums
	     */
	    mightBeEnum: mightBeEnum,
	
	    /**
	     * Gets an string version of an WebGL enum.
	     *
	     * Example:
	     *   WebGLDebugUtil.init(ctx);
	     *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
	     *
	     * @param {number} value Value to return an enum for
	     * @return {string} The string version of the enum.
	     */
	    glEnumToString: glEnumToString,
	
	    /**
	     * Converts the argument of a WebGL function to a string.
	     * Attempts to convert enum arguments to strings.
	     *
	     * Example:
	     *   WebGLDebugUtil.init(ctx);
	     *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 0, gl.TEXTURE_2D);
	     *
	     * would return 'TEXTURE_2D'
	     *
	     * @param {string} functionName the name of the WebGL function.
	     * @param {number} argumentIndx the index of the argument.
	     * @param {*} value The value of the argument.
	     * @return {string} The value as a string.
	     */
	    glFunctionArgToString: glFunctionArgToString,
	
	    /**
	     * Given a WebGL context returns a wrapped context that calls
	     * gl.getError after every command and calls a function if the
	     * result is not NO_ERROR.
	     *
	     * You can supply your own function if you want. For example, if you'd like
	     * an exception thrown on any GL error you could do this
	     *
	     *    function throwOnGLError(err, funcName, args) {
	     *      throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" +
	     *            funcName;
	     *    };
	     *
	     *    ctx = WebGLDebugUtils.makeDebugContext(
	     *        canvas.getContext("webgl"), throwOnGLError);
	     *
	     * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
	     * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
	     *     to call when gl.getError returns an error. If not specified the default
	     *     function calls console.log with a message.
	     */
	    makeDebugContext: makeDebugContext,
	
	    /**
	     * Given a WebGL context returns a wrapped context that adds 4
	     * functions.
	     *
	     * ctx.loseContext:
	     *   simulates a lost context event.
	     *
	     * ctx.restoreContext:
	     *   simulates the context being restored.
	     *
	     * ctx.registerOnContextLostListener(listener):
	     *   lets you register a listener for context lost. Use instead
	     *   of addEventListener('webglcontextlostevent', listener);
	     *
	     * ctx.registerOnContextRestoredListener(listener):
	     *   lets you register a listener for context restored. Use
	     *   instead of addEventListener('webglcontextrestored',
	     *   listener);
	     *
	     * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
	     */
	    makeLostContextSimulatingContext: makeLostContextSimulatingContext,
	
	    /**
	     * Resets a context to the initial state.
	     * @param {!WebGLRenderingContext} ctx The webgl context to
	     *     reset.
	     */
	    resetToInitialState: resetToInitialState
	  };
	})();

/***/ },
/* 2 */
/*!*******************************!*\
  !*** ./assets/webgl-utils.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)["default"];
	
	_core.Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	/**
	 * Setup utilities for WebGL
	 * @type {Object}
	 */
	var WebGLUtils = {
	  _create3DContext: function _create3DContext(canvas, opt_attribs) {
	    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	    var ctx = undefined;
	
	    // try all the different names associated
	    // with the retrieval of the 3d context from
	    // the various browser implementors.
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;
	
	    try {
	      for (var _iterator = _core.getIterator(names), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        var i = _step.value;
	
	        try {
	          ctx = canvas.getContext(i, opt_attribs);
	        } catch (e) {}
	
	        if (ctx) break;
	      }
	    } catch (err) {
	      _didIteratorError = true;
	      _iteratorError = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion && _iterator["return"]) {
	          _iterator["return"]();
	        }
	      } finally {
	        if (_didIteratorError) {
	          throw _iteratorError;
	        }
	      }
	    }
	
	    if (!ctx) throw new Error("GL instance coudl't be set.");
	
	    return ctx;
	  },
	
	  /**
	   * Generates a resize function that keeps
	   * canvas in sync with window resizing.
	   *
	   * Note: perspective matrix must be handled
	   *       elsewhere.
	   *
	   * @param  {HTMLElement} canvas
	   * @param  {gl} gl
	   * @param {Function} fun callback (width,
	   * height)
	   * @return {Function} resize function
	   */
	  genResizeFun: function genResizeFun(canvas, gl, fun) {
	    return function (shouldDraw) {
	      var clientWidth = canvas.clientWidth;
	      var clientHeight = canvas.clientHeight;
	
	      if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
	        canvas.width = clientWidth;
	        canvas.height = clientHeight;
	
	        gl.viewport(0, 0, canvas.width, canvas.height);
	        fun && fun.call(null, clientWidth, clientHeight, shouldDraw);
	      }
	    };
	  },
	
	  _loadTexture: function _loadTexture(gl, texture, u_Sampler, image) {
	    // Flip the image's y axis so that it
	    // matches webgl's coordinate system.
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	    // Enable texture unit0
	    gl.activeTexture(gl.TEXTURE0);
	    // Bind the texture object to the target
	    // (we're specifying the nature of the
	    // texture itself, not the nature of what is
	    // going to be attached to)
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	
	    // Set the texture parameters: tells to
	    // opengl how the image will be processed
	    // when the texture image is mapped to
	    // shapes.
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    // Set the texture image
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	
	    // Set the texture unit 0 to the sampler
	    gl.uniform1i(u_Sampler, 0);
	    // gl.clear(gl.COLOR_BUFFER_BIT);
	    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n_vertices);
	  },
	
	  initTextures: function initTextures(gl, u_Sampler, url) {
	    var image = new Image();
	    var texture = gl.createTexture();
	
	    if (!texture) throw new Error("Couldnt create the texture.");
	    if (!image) throw new Error("Couldnt create image");
	
	    image.onload = this._loadTexture.bind(null, gl, texture, u_Sampler, image);
	    image.src = url;
	  },
	
	  initBuffer: function initBuffer(gl, data, num, type, attrib_location, buffer_type) {
	    if (arguments.length < 5) throw new Error("initSimpleArrayBuffer requires all args");
	
	    var buff = gl.createBuffer();
	    if (!buff) throw new Error("Error while creating buffer");
	
	    buffer_type = buffer_type || gl.ARRAY_BUFFER;
	
	    gl.bindBuffer(buffer_type, buff);
	    if (data != null) gl.bufferData(buffer_type, data, gl.STATIC_DRAW);
	    if (attrib_location != null && num != null) gl.vertexAttribPointer(attrib_location, num, type, false, 0, 0);
	    gl.enableVertexAttribArray(attrib_location);
	
	    return buff;
	  },
	
	  /**
	   * Prepares the WebGL context.
	   * @param  {HTMLElement} canvas
	   * @param  {(Object|undefined)} opt_attribs
	   * @return {WebGLContext}
	   */
	  setupWebGL: function setupWebGL(canvas, opt_attribs) {
	    // WebGLRenderingContext exposes the
	    // principal interface in WebGL which
	    // provides special properties and methods
	    // to manipulate 3D content.
	    if (!window.WebGLRenderingContext) throw new Error("No WebGLRenderingContext in window.");
	
	    var ctx = this._create3DContext(canvas, opt_attribs);
	    if (!ctx) throw new Error("Couldn't retrieve webgl context.");
	
	    return ctx;
	  } };
	
	var Shaders = {
	  _createShader: function _createShader(gl, source, type) {
	    var shader = gl.createShader(type);
	
	    gl.shaderSource(shader, source);
	    gl.compileShader(shader);
	
	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader failed to compile: " + gl.getShaderInfoLog(shader));
	
	    return shader;
	  },
	
	  _createVertShader: function _createVertShader(gl, source) {
	    return this._createShader(gl, source, gl.VERTEX_SHADER);
	  },
	
	  _createFragShader: function _createFragShader(gl, source) {
	    return this._createShader(gl, source, gl.FRAGMENT_SHADER);
	  },
	
	  _createProgram: function _createProgram(gl, vshader, fshader) {
	    var program = gl.createProgram();
	
	    if (!program) throw new Error("_createProgram: coult not create program.");
	
	    gl.attachShader(program, vshader);
	    gl.attachShader(program, fshader);
	    gl.linkProgram(program);
	
	    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader program failed to link: " + gl.getProgramInfoLog(program));
	
	    return program;
	  },
	
	  /**
	   * Get attribute/uniform location from
	   * shaders considering the consistent
	   * notation of a_, u_, v_
	   * @param  {WebGLContext} gl
	   * @param  {Array} names
	   * @return {Array}
	   */
	  getLocations: function getLocations(gl, names) {
	    return names.reduce(function (mem, name) {
	      var location = undefined;
	
	      if (name.startsWith("a_")) location = gl.getAttribLocation(gl.program, name);else if (name.startsWith("u_")) location = gl.getUniformLocation(gl.program, name);else // enforcing name consistency
	        throw new Error("Attrib/Unif/Var must start with u_, a_ or v_");
	
	      if (! ~location) throw new Error("Failed to retrieve location of " + name);
	
	      mem[name] = location;
	
	      return mem;
	    }, {});
	  },
	
	  initFromSrc: function initFromSrc(gl, vsrc, fsrc) {
	    var use = arguments[3] === undefined ? true : arguments[3];
	
	    var v = this._createVertShader(gl, vsrc, gl.VERTEX_SHADER);
	    var f = this._createFragShader(gl, fsrc, gl.FRAGMENT_SHADER);
	    var program = this._createProgram(gl, v, f);
	
	    if (use) {
	      gl.useProgram(program);
	      gl.program = program;
	    }
	
	    if (!program) throw new Error("Failed to initialize shaders.");
	
	    return program;
	  },
	
	  initFromElems: function initFromElems(gl, vElem, fElem) {
	    var use = arguments[3] === undefined ? true : arguments[3];
	
	    return this.initFromSrc(gl, vElem.text, fElem.text, use);
	  },
	
	  // TODO
	  initFromUrl: function initFromUrl() {
	    return;
	  }
	};
	
	WebGLUtils.Shaders = Shaders;
	
	exports["default"] = WebGLUtils;
	module.exports = exports["default"];

/***/ },
/* 3 */
/*!*****************************************!*\
  !*** ./demos/4-obj-reader/ObjParser.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _toConsumableArray = __webpack_require__(/*! babel-runtime/helpers/to-consumable-array */ 6)['default'];
	
	var _slicedToArray = __webpack_require__(/*! babel-runtime/helpers/sliced-to-array */ 7)['default'];
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)['default'];
	
	_core.Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _vec3 = __webpack_require__(/*! gl-matrix */ 9);
	
	/**
	 * Helper functions
	 */
	var non_null = function non_null(val) {
	  return val != null;
	};
	var to_float = function to_float(val) {
	  return val == '' ? undefined : parseFloat(val);
	};
	var to_int = function to_int(val) {
	  return val == '' ? undefined : parseInt(val);
	};
	var to_int_minus_1 = function to_int_minus_1(val) {
	  return val == '' ? undefined : parseInt(val) - 1;
	};
	var slashed_to_array = function slashed_to_array(val) {
	  return val.split('/').map(to_float);
	};
	
	var FACES_TYPES = {
	  FACE: 'FACE',
	  FACE_TEXTURE: 'FACE_TEXTURE',
	  FACE_TEXTURE_NORMALS: 'FACE_TEXTURE_NORMALS',
	  FACE_NORMALS: 'FACE_NORMALS'
	};
	
	/**
	 * Parses .obj and returns a representation of
	 * that.
	 * @param  {string} text .obj source
	 * @param {bool} convert_quads if the parser
	 * should include quad_to_triangle conversion.
	 * @return {Object}
	 */
	function parse(text) {
	  var result = {
	    'new': true,
	    scale: 0,
	    center_of_mass: [0, 0, 0],
	
	    vertices_normals: [], // indices to obtain 'normals' prop
	    vertices_coords: [], // coordinates that are references to actual vertices
	
	    smooth_normals: [],
	    flat_normals: [],
	    vertices: [],
	    indices: [] };
	
	  var bigger_vertex_dist = 0;
	  var index_hashes = {};
	  var hash_vertices = {};
	  var same_vertices = {};
	  var index = 0;
	  var normal_index = 1;
	  var facesType = null;
	
	  text.split('\n').forEach(function (line) {
	    var _result$vertices_normals;
	
	    var match = line.match(/^(v|#|vn|vt|f)\s+/);
	
	    if (!match) return;
	
	    switch (match[1]) {
	      case 'v':
	        var _line$split$slice$map = line.split(' ').slice(1).map(to_float),
	            _line$split$slice$map2 = _slicedToArray(_line$split$slice$map, 3),
	            x = _line$split$slice$map2[0],
	            y = _line$split$slice$map2[1],
	            z = _line$split$slice$map2[2];
	
	        var dist = x * x + y * y + z * z;
	
	        result.center_of_mass[0] += x;
	        result.center_of_mass[1] += y;
	        result.center_of_mass[2] += z;
	
	        if (dist > bigger_vertex_dist) bigger_vertex_dist = dist;
	
	        result.vertices_coords.push(x, y, z);
	        break;
	
	      case 'vn':
	        (_result$vertices_normals = result.vertices_normals).push.apply(_result$vertices_normals, _toConsumableArray(line.split(' ').slice(1).map(to_float)));
	        break;
	
	      case 'f':
	        var faces = line.split(' ').slice(1);
	
	        // cache the type of face that we're
	        // dealing with
	        if (!facesType) {
	          if (~faces[0].indexOf('//')) facesType = FACES_TYPES.FACE_NORMALS;else if (faces[0].match(/\d+\/\d+\/\d+/)) facesType = FACES_TYPES.FACE_TEXTURE_NORMALS;else facesType = FACES_TYPES.FACE;
	        }
	
	        // transform quad faces into triang
	        // faces
	        if (faces.length === 4) faces = [faces[0], faces[1], faces[2], faces[2], faces[3], faces[0]];else if (faces.length > 4) throw new Error('can\'t deal with ' + faces.length + 'd faces');
	
	        // if no normals info, fix it. ps: note
	        // that this will work even for quad
	        // faces as the result of the normal
	        // calculate won't vary.
	        if (facesType === FACES_TYPES.FACE) {
	          (function () {
	            var facesI = faces.map(to_int_minus_1);
	
	            var v0 = [result.vertices_coords[facesI[0] * 3 + 0], result.vertices_coords[facesI[0] * 3 + 1], result.vertices_coords[facesI[0] * 3 + 2]];
	            var v1 = [result.vertices_coords[facesI[1] * 3 + 0], result.vertices_coords[facesI[1] * 3 + 1], result.vertices_coords[facesI[1] * 3 + 2]];
	            var v2 = [result.vertices_coords[facesI[2] * 3 + 0], result.vertices_coords[facesI[2] * 3 + 1], result.vertices_coords[facesI[2] * 3 + 2]];
	
	            // calculate the normal of the current face
	            var face_normal = getNormal(v0, v1, v2);
	            var found_index = -1;
	
	            // see if we have previously added a
	            // normal that is the same of this.
	            for (var i = 0; i < result.vertices_normals.length; i += 3) {
	              if (result.vertices_normals[i + 0] === face_normal[0] && result.vertices_normals[i + 1] === face_normal[1] && result.vertices_normals[i + 2] === face_normal[2]) {
	                found_index = i / 3 + 1;
	              }
	            }
	
	            // didn't found another normal like
	            // that
	            if (! ~found_index) {
	              var _result$vertices_normals2;
	
	              (_result$vertices_normals2 = result.vertices_normals).push.apply(_result$vertices_normals2, _toConsumableArray(face_normal));
	              found_index = normal_index++;
	            }
	
	            faces = faces.map(function (face) {
	              return face + '//' + found_index;
	            });
	          })();
	        }
	
	        // face corresponds to a 'v/t/n' grouping
	        faces.forEach(function (face) {
	          // do not process redundant faces
	          if (face in index_hashes) return result.indices.push(index_hashes[face]);
	
	          // 0-index
	
	          var _face$split = face.split('/');
	
	          var _face$split2 = _slicedToArray(_face$split, 3);
	
	          var verticeI = _face$split2[0];
	          var textureI = _face$split2[1];
	          var normalI = _face$split2[2];
	
	          normalI = +normalI - 1;
	          verticeI = +verticeI - 1;
	
	          // store where same vertices lives in
	          // indexes
	          if (same_vertices[verticeI] == null) same_vertices[verticeI] = [];
	          same_vertices[verticeI].push(result.vertices.length);
	
	          result.vertices.push(result.vertices_coords[verticeI * 3], result.vertices_coords[verticeI * 3 + 1], result.vertices_coords[verticeI * 3 + 2]);
	          result.flat_normals.push(result.vertices_normals[normalI * 3], result.vertices_normals[normalI * 3 + 1], result.vertices_normals[normalI * 3 + 2]);
	          result.smooth_normals.push(result.vertices_normals[normalI * 3], result.vertices_normals[normalI * 3 + 1], result.vertices_normals[normalI * 3 + 2]);
	
	          index_hashes[face] = index;
	          result.indices.push(index++);
	        });
	        break;
	
	      case '#':
	      case 'vt':
	        break;
	    }
	  });
	
	  var _loop = function (i) {
	    var indexes = same_vertices[i];
	    var result_normal = indexes.reduce(function (mem, index) {
	      mem[0] += result.smooth_normals[index];
	      mem[1] += result.smooth_normals[index + 1];
	      mem[2] += result.smooth_normals[index + 2];
	
	      return mem;
	    }, [0, 0, 0]);
	
	    _vec3.vec3.normalize(result_normal, _vec3.vec3.clone(result_normal));
	
	    indexes.forEach(function (index) {
	      result.smooth_normals[index] = result_normal[0];
	      result.smooth_normals[index + 1] = result_normal[1];
	      result.smooth_normals[index + 2] = result_normal[2];
	    });
	  };
	
	  for (var i in same_vertices) {
	    _loop(i);
	  }
	
	  if (result.vertices_coords.length) {
	    result.scale = Math.sqrt(3) / Math.sqrt(bigger_vertex_dist);
	    result.center_of_mass = result.center_of_mass.map(function (elem) {
	      return elem / result.vertices_coords.length;
	    });
	  }
	
	  return result;
	}
	
	/**
	 * cross(v1,v2) = surface_normal. being
	 * 'a','b' and 'c' points that describe a
	 * triangle, v1 = b-a, v2 = c-a.
	 *
	 * Cross:
	 *   * ox = (y1 * z2) - (y2 * z1)
	 *   * oy = (z1 * x2) - (z2 * x1)
	 *   * oz = (x1 * y2) - (x2 * y1)
	 *
	 * Note that:
	 *   - getNormal(a,b,c) = -getNormal(a,c,b).
	 *
	 * @param  {Array} a point
	 * @param  {Array} b point
	 * @param  {Array} c point
	 * @return {Array}   normal vector
	 */
	function getNormal(a, b, c) {
	  var v1 = b.map(function (elem, i) {
	    return elem - a[i];
	  });
	  var v2 = c.map(function (elem, i) {
	    return elem - a[i];
	  });
	  var normal = _vec3.vec3.create();
	
	  normal[0] = v1[1] * v2[2] - v1[2] * v2[1];
	  normal[1] = v1[2] * v2[0] - v1[0] * v2[2];
	  normal[2] = v1[0] * v2[1] - v1[1] * v2[0];
	
	  _vec3.vec3.normalize(normal, normal);
	
	  return normal;
	}
	
	exports['default'] = {
	  parse: parse,
	  getNormal: getNormal,
	  FACES_TYPES: FACES_TYPES,
	
	  to_float: to_float,
	  slashed_to_array: slashed_to_array,
	  non_null: non_null
	};
	module.exports = exports['default'];
	// final buffer data

/***/ },
/* 4 */
/*!************************************!*\
  !*** ./~/babel-runtime/core-js.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  "default": __webpack_require__(/*! core-js/library */ 10),
	  __esModule: true
	};


/***/ },
/* 5 */
/*!*************************************************************!*\
  !*** ./~/babel-runtime/helpers/interop-require-wildcard.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 6 */
/*!********************************************************!*\
  !*** ./~/babel-runtime/helpers/to-consumable-array.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)["default"];
	
	exports["default"] = function (arr) {
	  if (_core.Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
	
	    return arr2;
	  } else {
	    return _core.Array.from(arr);
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 7 */
/*!****************************************************!*\
  !*** ./~/babel-runtime/helpers/sliced-to-array.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(/*! babel-runtime/core-js */ 4)["default"];
	
	exports["default"] = function (arr, i) {
	  if (_core.Array.isArray(arr)) {
	    return arr;
	  } else if (_core.isIterable(Object(arr))) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;
	
	    try {
	      for (var _i = _core.getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);
	
	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }
	
	    return _arr;
	  } else {
	    throw new TypeError("Invalid attempt to destructure non-iterable instance");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 8 */
/*!*****************************!*\
  !*** ./~/babel/polyfill.js ***!
  \*****************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! babel-core/polyfill */ 11);


/***/ },
/* 9 */
/*!***************************************!*\
  !*** ./~/gl-matrix/dist/gl-matrix.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview gl-matrix - High performance matrix and vector operations
	 * @author Brandon Jones
	 * @author Colin MacKenzie IV
	 * @version 2.1.0
	 */
	
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	
	(function() {
	  "use strict";
	
	  var shim = {};
	  if (false) {
	    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
	      shim.exports = {};
	      define(function() {
	        return shim.exports;
	      });
	    } else {
	      // gl-matrix lives in a browser, define its namespaces in global
	      shim.exports = window;
	    }    
	  }
	  else {
	    // gl-matrix lives in commonjs, define its namespaces in exports
	    shim.exports = exports;
	  }
	
	  (function(exports) {
	    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	
	if(!GLMAT_EPSILON) {
	    var GLMAT_EPSILON = 0.000001;
	}
	
	if(!GLMAT_ARRAY_TYPE) {
	    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	}
	
	/**
	 * @class Common utilities
	 * @name glMatrix
	 */
	var glMatrix = {};
	
	/**
	 * Sets the type of array used when creating new vectors and matricies
	 *
	 * @param {Type} type Array type, such as Float32Array or Array
	 */
	glMatrix.setMatrixArrayType = function(type) {
	    GLMAT_ARRAY_TYPE = type;
	}
	
	if(typeof(exports) !== 'undefined') {
	    exports.glMatrix = glMatrix;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2 Dimensional Vector
	 * @name vec2
	 */
	
	var vec2 = {};
	
	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */
	vec2.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with values from an existing vector
	 *
	 * @param {vec2} a vector to clone
	 * @returns {vec2} a new 2D vector
	 */
	vec2.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Creates a new vec2 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} a new 2D vector
	 */
	vec2.fromValues = function(x, y) {
	    var out = new GLMAT_ARRAY_TYPE(2);
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Copy the values from one vec2 to another
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the source vector
	 * @returns {vec2} out
	 */
	vec2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};
	
	/**
	 * Set the components of a vec2 to the given values
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} out
	 */
	vec2.set = function(out, x, y) {
	    out[0] = x;
	    out[1] = y;
	    return out;
	};
	
	/**
	 * Adds two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    return out;
	};
	
	/**
	 * Subtracts two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.subtract}
	 * @function
	 */
	vec2.sub = vec2.subtract;
	
	/**
	 * Multiplies two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.multiply}
	 * @function
	 */
	vec2.mul = vec2.multiply;
	
	/**
	 * Divides two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    return out;
	};
	
	/**
	 * Alias for {@link vec2.divide}
	 * @function
	 */
	vec2.div = vec2.divide;
	
	/**
	 * Returns the minimum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    return out;
	};
	
	/**
	 * Scales a vec2 by a scalar number
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec2} out
	 */
	vec2.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec2.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.distance}
	 * @function
	 */
	vec2.dist = vec2.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec2.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredDistance}
	 * @function
	 */
	vec2.sqrDist = vec2.squaredDistance;
	
	/**
	 * Calculates the length of a vec2
	 *
	 * @param {vec2} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec2.length = function (a) {
	    var x = a[0],
	        y = a[1];
	    return Math.sqrt(x*x + y*y);
	};
	
	/**
	 * Alias for {@link vec2.length}
	 * @function
	 */
	vec2.len = vec2.length;
	
	/**
	 * Calculates the squared length of a vec2
	 *
	 * @param {vec2} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec2.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1];
	    return x*x + y*y;
	};
	
	/**
	 * Alias for {@link vec2.squaredLength}
	 * @function
	 */
	vec2.sqrLen = vec2.squaredLength;
	
	/**
	 * Negates the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to negate
	 * @returns {vec2} out
	 */
	vec2.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    return out;
	};
	
	/**
	 * Normalize a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to normalize
	 * @returns {vec2} out
	 */
	vec2.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1];
	    var len = x*x + y*y;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec2.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	};
	
	/**
	 * Computes the cross product of two vec2's
	 * Note that the cross product must by definition produce a 3D vector
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec3} out
	 */
	vec2.cross = function(out, a, b) {
	    var z = a[0] * b[1] - a[1] * b[0];
	    out[0] = out[1] = 0;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec2} out
	 */
	vec2.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y;
	    out[1] = m[1] * x + m[3] * y;
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat2d
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2d} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2d = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y + m[4];
	    out[1] = m[1] * x + m[3] * y + m[5];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat3
	 * 3rd vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat3} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat3 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[3] * y + m[6];
	    out[1] = m[1] * x + m[4] * y + m[7];
	    return out;
	};
	
	/**
	 * Transforms the vec2 with a mat4
	 * 3rd vector component is implicitly '0'
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat4 = function(out, a, m) {
	    var x = a[0], 
	        y = a[1];
	    out[0] = m[0] * x + m[4] * y + m[12];
	    out[1] = m[1] * x + m[5] * y + m[13];
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec2.forEach = (function() {
	    var vec = vec2.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 2;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec2} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec2.str = function (a) {
	    return 'vec2(' + a[0] + ', ' + a[1] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec2 = vec2;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 3 Dimensional Vector
	 * @name vec3
	 */
	
	var vec3 = {};
	
	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */
	vec3.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with values from an existing vector
	 *
	 * @param {vec3} a vector to clone
	 * @returns {vec3} a new 3D vector
	 */
	vec3.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Creates a new vec3 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} a new 3D vector
	 */
	vec3.fromValues = function(x, y, z) {
	    var out = new GLMAT_ARRAY_TYPE(3);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Copy the values from one vec3 to another
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the source vector
	 * @returns {vec3} out
	 */
	vec3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};
	
	/**
	 * Set the components of a vec3 to the given values
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} out
	 */
	vec3.set = function(out, x, y, z) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};
	
	/**
	 * Adds two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    return out;
	};
	
	/**
	 * Subtracts two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.subtract}
	 * @function
	 */
	vec3.sub = vec3.subtract;
	
	/**
	 * Multiplies two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.multiply}
	 * @function
	 */
	vec3.mul = vec3.multiply;
	
	/**
	 * Divides two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    return out;
	};
	
	/**
	 * Alias for {@link vec3.divide}
	 * @function
	 */
	vec3.div = vec3.divide;
	
	/**
	 * Returns the minimum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    return out;
	};
	
	/**
	 * Scales a vec3 by a scalar number
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec3} out
	 */
	vec3.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec3.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.distance}
	 * @function
	 */
	vec3.dist = vec3.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec3.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredDistance}
	 * @function
	 */
	vec3.sqrDist = vec3.squaredDistance;
	
	/**
	 * Calculates the length of a vec3
	 *
	 * @param {vec3} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec3.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};
	
	/**
	 * Alias for {@link vec3.length}
	 * @function
	 */
	vec3.len = vec3.length;
	
	/**
	 * Calculates the squared length of a vec3
	 *
	 * @param {vec3} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec3.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return x*x + y*y + z*z;
	};
	
	/**
	 * Alias for {@link vec3.squaredLength}
	 * @function
	 */
	vec3.sqrLen = vec3.squaredLength;
	
	/**
	 * Negates the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to negate
	 * @returns {vec3} out
	 */
	vec3.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    return out;
	};
	
	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */
	vec3.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    var len = x*x + y*y + z*z;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec3.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};
	
	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.cross = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2],
	        bx = b[0], by = b[1], bz = b[2];
	
	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	};
	
	/**
	 * Performs a linear interpolation between two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a mat4.
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
	    return out;
	};
	
	/**
	 * Transforms the vec3 with a quat
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec3} out
	 */
	vec3.transformQuat = function(out, a, q) {
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec3.forEach = (function() {
	    var vec = vec3.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 3;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec3} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec3.str = function (a) {
	    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec3 = vec3;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 4 Dimensional Vector
	 * @name vec4
	 */
	
	var vec4 = {};
	
	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */
	vec4.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with values from an existing vector
	 *
	 * @param {vec4} a vector to clone
	 * @returns {vec4} a new 4D vector
	 */
	vec4.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Creates a new vec4 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} a new 4D vector
	 */
	vec4.fromValues = function(x, y, z, w) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Copy the values from one vec4 to another
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the source vector
	 * @returns {vec4} out
	 */
	vec4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set the components of a vec4 to the given values
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} out
	 */
	vec4.set = function(out, x, y, z, w) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};
	
	/**
	 * Adds two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	};
	
	/**
	 * Subtracts two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.subtract}
	 * @function
	 */
	vec4.sub = vec4.subtract;
	
	/**
	 * Multiplies two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    out[3] = a[3] * b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.multiply}
	 * @function
	 */
	vec4.mul = vec4.multiply;
	
	/**
	 * Divides two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    out[3] = a[3] / b[3];
	    return out;
	};
	
	/**
	 * Alias for {@link vec4.divide}
	 * @function
	 */
	vec4.div = vec4.divide;
	
	/**
	 * Returns the minimum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    out[3] = Math.min(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Returns the maximum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    out[3] = Math.max(a[3], b[3]);
	    return out;
	};
	
	/**
	 * Scales a vec4 by a scalar number
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec4} out
	 */
	vec4.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    return out;
	};
	
	/**
	 * Calculates the euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec4.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.distance}
	 * @function
	 */
	vec4.dist = vec4.distance;
	
	/**
	 * Calculates the squared euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec4.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredDistance}
	 * @function
	 */
	vec4.sqrDist = vec4.squaredDistance;
	
	/**
	 * Calculates the length of a vec4
	 *
	 * @param {vec4} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec4.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};
	
	/**
	 * Alias for {@link vec4.length}
	 * @function
	 */
	vec4.len = vec4.length;
	
	/**
	 * Calculates the squared length of a vec4
	 *
	 * @param {vec4} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec4.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return x*x + y*y + z*z + w*w;
	};
	
	/**
	 * Alias for {@link vec4.squaredLength}
	 * @function
	 */
	vec4.sqrLen = vec4.squaredLength;
	
	/**
	 * Negates the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to negate
	 * @returns {vec4} out
	 */
	vec4.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = -a[3];
	    return out;
	};
	
	/**
	 * Normalize a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to normalize
	 * @returns {vec4} out
	 */
	vec4.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    var len = x*x + y*y + z*z + w*w;
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	        out[3] = a[3] * len;
	    }
	    return out;
	};
	
	/**
	 * Calculates the dot product of two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec4.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	};
	
	/**
	 * Performs a linear interpolation between two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec4} out
	 */
	vec4.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2],
	        aw = a[3];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    out[3] = aw + t * (b[3] - aw);
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec4} out
	 */
	vec4.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	};
	
	/**
	 * Transforms the vec4 with a quat
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec4} out
	 */
	vec4.transformQuat = function(out, a, q) {
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],
	
	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;
	
	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};
	
	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec4.forEach = (function() {
	    var vec = vec4.create();
	
	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 4;
	        }
	
	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }
	
	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
	        }
	        
	        return a;
	    };
	})();
	
	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec4} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec4.str = function (a) {
	    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.vec4 = vec4;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2x2 Matrix
	 * @name mat2
	 */
	
	var mat2 = {};
	
	var mat2Identity = new Float32Array([
	    1, 0,
	    0, 1
	]);
	
	/**
	 * Creates a new identity mat2
	 *
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat2 initialized with values from an existing matrix
	 *
	 * @param {mat2} a matrix to clone
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2 to another
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Set a mat2 to the identity matrix
	 *
	 * @param {mat2} out the receiving matrix
	 * @returns {mat2} out
	 */
	mat2.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a1 = a[1];
	        out[1] = a[2];
	        out[2] = a1;
	    } else {
	        out[0] = a[0];
	        out[1] = a[2];
	        out[2] = a[1];
	        out[3] = a[3];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	
	        // Calculate the determinant
	        det = a0 * a3 - a2 * a1;
	
	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    
	    out[0] =  a3 * det;
	    out[1] = -a1 * det;
	    out[2] = -a2 * det;
	    out[3] =  a0 * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.adjoint = function(out, a) {
	    // Caching this value is nessecary if out == a
	    var a0 = a[0];
	    out[0] =  a[3];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] =  a0;
	
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2
	 *
	 * @param {mat2} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2.determinant = function (a) {
	    return a[0] * a[3] - a[2] * a[1];
	};
	
	/**
	 * Multiplies two mat2's
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = a0 * b0 + a1 * b2;
	    out[1] = a0 * b1 + a1 * b3;
	    out[2] = a2 * b0 + a3 * b2;
	    out[3] = a2 * b1 + a3 * b3;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2.multiply}
	 * @function
	 */
	mat2.mul = mat2.multiply;
	
	/**
	 * Rotates a mat2 by the given angle
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a1 * s;
	    out[1] = a0 * -s + a1 * c;
	    out[2] = a2 *  c + a3 * s;
	    out[3] = a2 * -s + a3 * c;
	    return out;
	};
	
	/**
	 * Scales the mat2 by the dimensions in the given vec2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2} out
	 **/
	mat2.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v1;
	    out[2] = a2 * v0;
	    out[3] = a3 * v1;
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat2
	 *
	 * @param {mat2} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2.str = function (a) {
	    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat2 = mat2;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 2x3 Matrix
	 * @name mat2d
	 * 
	 * @description 
	 * A mat2d contains six elements defined as:
	 * <pre>
	 * [a, b,
	 *  c, d,
	 *  tx,ty]
	 * </pre>
	 * This is a short form for the 3x3 matrix:
	 * <pre>
	 * [a, b, 0
	 *  c, d, 0
	 *  tx,ty,1]
	 * </pre>
	 * The last column is ignored so the array is shorter and operations are faster.
	 */
	
	var mat2d = {};
	
	var mat2dIdentity = new Float32Array([
	    1, 0,
	    0, 1,
	    0, 0
	]);
	
	/**
	 * Creates a new identity mat2d
	 *
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(6);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Creates a new mat2d initialized with values from an existing matrix
	 *
	 * @param {mat2d} a matrix to clone
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(6);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Copy the values from one mat2d to another
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};
	
	/**
	 * Set a mat2d to the identity matrix
	 *
	 * @param {mat2d} out the receiving matrix
	 * @returns {mat2d} out
	 */
	mat2d.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};
	
	/**
	 * Inverts a mat2d
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.invert = function(out, a) {
	    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
	        atx = a[4], aty = a[5];
	
	    var det = aa * ad - ab * ac;
	    if(!det){
	        return null;
	    }
	    det = 1.0 / det;
	
	    out[0] = ad * det;
	    out[1] = -ab * det;
	    out[2] = -ac * det;
	    out[3] = aa * det;
	    out[4] = (ac * aty - ad * atx) * det;
	    out[5] = (ab * atx - aa * aty) * det;
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat2d
	 *
	 * @param {mat2d} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2d.determinant = function (a) {
	    return a[0] * a[3] - a[1] * a[2];
	};
	
	/**
	 * Multiplies two mat2d's
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.multiply = function (out, a, b) {
	    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
	        atx = a[4], aty = a[5],
	        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
	        btx = b[4], bty = b[5];
	
	    out[0] = aa*ba + ab*bc;
	    out[1] = aa*bb + ab*bd;
	    out[2] = ac*ba + ad*bc;
	    out[3] = ac*bb + ad*bd;
	    out[4] = ba*atx + bc*aty + btx;
	    out[5] = bb*atx + bd*aty + bty;
	    return out;
	};
	
	/**
	 * Alias for {@link mat2d.multiply}
	 * @function
	 */
	mat2d.mul = mat2d.multiply;
	
	
	/**
	 * Rotates a mat2d by the given angle
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.rotate = function (out, a, rad) {
	    var aa = a[0],
	        ab = a[1],
	        ac = a[2],
	        ad = a[3],
	        atx = a[4],
	        aty = a[5],
	        st = Math.sin(rad),
	        ct = Math.cos(rad);
	
	    out[0] = aa*ct + ab*st;
	    out[1] = -aa*st + ab*ct;
	    out[2] = ac*ct + ad*st;
	    out[3] = -ac*st + ct*ad;
	    out[4] = ct*atx + st*aty;
	    out[5] = ct*aty - st*atx;
	    return out;
	};
	
	/**
	 * Scales the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {mat2d} v the vec2 to scale the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.scale = function(out, a, v) {
	    var vx = v[0], vy = v[1];
	    out[0] = a[0] * vx;
	    out[1] = a[1] * vy;
	    out[2] = a[2] * vx;
	    out[3] = a[3] * vy;
	    out[4] = a[4] * vx;
	    out[5] = a[5] * vy;
	    return out;
	};
	
	/**
	 * Translates the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {mat2d} v the vec2 to translate the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.translate = function(out, a, v) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4] + v[0];
	    out[5] = a[5] + v[1];
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat2d
	 *
	 * @param {mat2d} a matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2d.str = function (a) {
	    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat2d = mat2d;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 3x3 Matrix
	 * @name mat3
	 */
	
	var mat3 = {};
	
	var mat3Identity = new Float32Array([
	    1, 0, 0,
	    0, 1, 0,
	    0, 0, 1
	]);
	
	/**
	 * Creates a new identity mat3
	 *
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(9);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat3 initialized with values from an existing matrix
	 *
	 * @param {mat3} a matrix to clone
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(9);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Copy the values from one mat3 to another
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Set a mat3 to the identity matrix
	 *
	 * @param {mat3} out the receiving matrix
	 * @returns {mat3} out
	 */
	mat3.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a12 = a[5];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a01;
	        out[5] = a[7];
	        out[6] = a02;
	        out[7] = a12;
	    } else {
	        out[0] = a[0];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a[1];
	        out[4] = a[4];
	        out[5] = a[7];
	        out[6] = a[2];
	        out[7] = a[5];
	        out[8] = a[8];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b01 = a22 * a11 - a12 * a21,
	        b11 = -a22 * a10 + a12 * a20,
	        b21 = a21 * a10 - a11 * a20,
	
	        // Calculate the determinant
	        det = a00 * b01 + a01 * b11 + a02 * b21;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = b01 * det;
	    out[1] = (-a22 * a01 + a02 * a21) * det;
	    out[2] = (a12 * a01 - a02 * a11) * det;
	    out[3] = b11 * det;
	    out[4] = (a22 * a00 - a02 * a20) * det;
	    out[5] = (-a12 * a00 + a02 * a10) * det;
	    out[6] = b21 * det;
	    out[7] = (-a21 * a00 + a01 * a20) * det;
	    out[8] = (a11 * a00 - a01 * a10) * det;
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    out[0] = (a11 * a22 - a12 * a21);
	    out[1] = (a02 * a21 - a01 * a22);
	    out[2] = (a01 * a12 - a02 * a11);
	    out[3] = (a12 * a20 - a10 * a22);
	    out[4] = (a00 * a22 - a02 * a20);
	    out[5] = (a02 * a10 - a00 * a12);
	    out[6] = (a10 * a21 - a11 * a20);
	    out[7] = (a01 * a20 - a00 * a21);
	    out[8] = (a00 * a11 - a01 * a10);
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat3
	 *
	 * @param {mat3} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat3.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];
	
	    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
	};
	
	/**
	 * Multiplies two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        b00 = b[0], b01 = b[1], b02 = b[2],
	        b10 = b[3], b11 = b[4], b12 = b[5],
	        b20 = b[6], b21 = b[7], b22 = b[8];
	
	    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
	
	    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
	
	    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	    return out;
	};
	
	/**
	 * Alias for {@link mat3.multiply}
	 * @function
	 */
	mat3.mul = mat3.multiply;
	
	/**
	 * Translate a mat3 by the given vector
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to translate
	 * @param {vec2} v vector to translate by
	 * @returns {mat3} out
	 */
	mat3.translate = function(out, a, v) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	        x = v[0], y = v[1];
	
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	
	    out[3] = a10;
	    out[4] = a11;
	    out[5] = a12;
	
	    out[6] = x * a00 + y * a10 + a20;
	    out[7] = x * a01 + y * a11 + a21;
	    out[8] = x * a02 + y * a12 + a22;
	    return out;
	};
	
	/**
	 * Rotates a mat3 by the given angle
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.rotate = function (out, a, rad) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	
	    out[0] = c * a00 + s * a10;
	    out[1] = c * a01 + s * a11;
	    out[2] = c * a02 + s * a12;
	
	    out[3] = c * a10 - s * a00;
	    out[4] = c * a11 - s * a01;
	    out[5] = c * a12 - s * a02;
	
	    out[6] = a20;
	    out[7] = a21;
	    out[8] = a22;
	    return out;
	};
	
	/**
	 * Scales the mat3 by the dimensions in the given vec2
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat3} out
	 **/
	mat3.scale = function(out, a, v) {
	    var x = v[0], y = v[2];
	
	    out[0] = x * a[0];
	    out[1] = x * a[1];
	    out[2] = x * a[2];
	
	    out[3] = y * a[3];
	    out[4] = y * a[4];
	    out[5] = y * a[5];
	
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};
	
	/**
	 * Copies the values from a mat2d into a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat3} out
	 **/
	mat3.fromMat2d = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = 0;
	
	    out[3] = a[2];
	    out[4] = a[3];
	    out[5] = 0;
	
	    out[6] = a[4];
	    out[7] = a[5];
	    out[8] = 1;
	    return out;
	};
	
	/**
	* Calculates a 3x3 matrix from the given quaternion
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {quat} q Quaternion to create matrix from
	*
	* @returns {mat3} out
	*/
	mat3.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	
	    out[3] = xy - wz;
	    out[4] = 1 - (xx + zz);
	    out[5] = yz + wx;
	
	    out[6] = xz + wy;
	    out[7] = yz - wx;
	    out[8] = 1 - (xx + yy);
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat3
	 *
	 * @param {mat3} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat3.str = function (a) {
	    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
	                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat3 = mat3;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class 4x4 Matrix
	 * @name mat4
	 */
	
	var mat4 = {};
	
	var mat4Identity = new Float32Array([
	    1, 0, 0, 0,
	    0, 1, 0, 0,
	    0, 0, 1, 0,
	    0, 0, 0, 1
	]);
	
	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(16);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Creates a new mat4 initialized with values from an existing matrix
	 *
	 * @param {mat4} a matrix to clone
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.clone = function(a) {
	    var out = new GLMAT_ARRAY_TYPE(16);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Copy the values from one mat4 to another
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */
	mat4.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Transpose the values of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a03 = a[3],
	            a12 = a[6], a13 = a[7],
	            a23 = a[11];
	
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02;
	        out[9] = a12;
	        out[11] = a[14];
	        out[12] = a03;
	        out[13] = a13;
	        out[14] = a23;
	    } else {
	        out[0] = a[0];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a[1];
	        out[5] = a[5];
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a[2];
	        out[9] = a[6];
	        out[10] = a[10];
	        out[11] = a[14];
	        out[12] = a[3];
	        out[13] = a[7];
	        out[14] = a[11];
	        out[15] = a[15];
	    }
	    
	    return out;
	};
	
	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,
	
	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	
	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;
	
	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	
	    return out;
	};
	
	/**
	 * Calculates the adjugate of a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	    return out;
	};
	
	/**
	 * Calculates the determinant of a mat4
	 *
	 * @param {mat4} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat4.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
	
	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32;
	
	    // Calculate the determinant
	    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	};
	
	/**
	 * Multiplies two mat4's
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
	
	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	
	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	};
	
	/**
	 * Alias for {@link mat4.multiply}
	 * @function
	 */
	mat4.mul = mat4.multiply;
	
	/**
	 * Translate a mat4 by the given vector
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.translate = function (out, a, v) {
	    var x = v[0], y = v[1], z = v[2],
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23;
	
	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    } else {
	        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
	        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
	        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
	
	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }
	
	    return out;
	};
	
	/**
	 * Scales the mat4 by the dimensions in the given vec3
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/
	mat4.scale = function(out, a, v) {
	    var x = v[0], y = v[1], z = v[2];
	
	    out[0] = a[0] * x;
	    out[1] = a[1] * x;
	    out[2] = a[2] * x;
	    out[3] = a[3] * x;
	    out[4] = a[4] * y;
	    out[5] = a[5] * y;
	    out[6] = a[6] * y;
	    out[7] = a[7] * y;
	    out[8] = a[8] * z;
	    out[9] = a[9] * z;
	    out[10] = a[10] * z;
	    out[11] = a[11] * z;
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};
	
	/**
	 * Rotates a mat4 by the given angle
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.rotate = function (out, a, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t,
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23,
	        b00, b01, b02,
	        b10, b11, b12,
	        b20, b21, b22;
	
	    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
	    
	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;
	
	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;
	
	    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
	
	    // Construct the elements of the rotation matrix
	    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
	    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
	    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
	
	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateX = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	        out[3]  = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Y axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateY = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	};
	
	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateZ = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7];
	
	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8]  = a[8];
	        out[9]  = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	
	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	};
	
	/**
	 * Creates a matrix from a quaternion rotation and vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslation = function (out, q, v) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    
	    return out;
	};
	
	/**
	* Calculates a 4x4 matrix from the given quaternion
	*
	* @param {mat4} out mat4 receiving operation result
	* @param {quat} q Quaternion to create matrix from
	*
	* @returns {mat4} out
	*/
	mat4.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,
	
	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;
	
	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Generates a frustum matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {Number} left Left bound of the frustum
	 * @param {Number} right Right bound of the frustum
	 * @param {Number} bottom Bottom bound of the frustum
	 * @param {Number} top Top bound of the frustum
	 * @param {Number} near Near bound of the frustum
	 * @param {Number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.frustum = function (out, left, right, bottom, top, near, far) {
	    var rl = 1 / (right - left),
	        tb = 1 / (top - bottom),
	        nf = 1 / (near - far);
	    out[0] = (near * 2) * rl;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = (near * 2) * tb;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = (right + left) * rl;
	    out[9] = (top + bottom) * tb;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (far * near * 2) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a perspective projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspective = function (out, fovy, aspect, near, far) {
	    var f = 1.0 / Math.tan(fovy / 2),
	        nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	    return out;
	};
	
	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.ortho = function (out, left, right, bottom, top, near, far) {
	    var lr = 1 / (left - right),
	        bt = 1 / (bottom - top),
	        nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};
	
	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {vec3} eye Position of the viewer
	 * @param {vec3} center Point the viewer is looking at
	 * @param {vec3} up vec3 pointing up
	 * @returns {mat4} out
	 */
	mat4.lookAt = function (out, eye, center, up) {
	    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
	        eyex = eye[0],
	        eyey = eye[1],
	        eyez = eye[2],
	        upx = up[0],
	        upy = up[1],
	        upz = up[2],
	        centerx = center[0],
	        centery = center[1],
	        centerz = center[2];
	
	    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
	        Math.abs(eyey - centery) < GLMAT_EPSILON &&
	        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
	        return mat4.identity(out);
	    }
	
	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;
	
	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;
	
	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    } else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }
	
	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;
	
	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    } else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }
	
	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;
	
	    return out;
	};
	
	/**
	 * Returns a string representation of a mat4
	 *
	 * @param {mat4} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat4.str = function (a) {
	    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
	                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
	                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
	                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.mat4 = mat4;
	}
	;
	/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.
	
	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:
	
	  * Redistributions of source code must retain the above copyright notice, this
	    list of conditions and the following disclaimer.
	  * Redistributions in binary form must reproduce the above copyright notice,
	    this list of conditions and the following disclaimer in the documentation 
	    and/or other materials provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
	
	/**
	 * @class Quaternion
	 * @name quat
	 */
	
	var quat = {};
	
	var quatIdentity = new Float32Array([0, 0, 0, 1]);
	
	/**
	 * Creates a new identity quat
	 *
	 * @returns {quat} a new quaternion
	 */
	quat.create = function() {
	    var out = new GLMAT_ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Creates a new quat initialized with values from an existing quaternion
	 *
	 * @param {quat} a quaternion to clone
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.clone = vec4.clone;
	
	/**
	 * Creates a new quat initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.fromValues = vec4.fromValues;
	
	/**
	 * Copy the values from one quat to another
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the source quaternion
	 * @returns {quat} out
	 * @function
	 */
	quat.copy = vec4.copy;
	
	/**
	 * Set the components of a quat to the given values
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} out
	 * @function
	 */
	quat.set = vec4.set;
	
	/**
	 * Set a quat to the identity quaternion
	 *
	 * @param {quat} out the receiving quaternion
	 * @returns {quat} out
	 */
	quat.identity = function(out) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};
	
	/**
	 * Sets a quat from the given angle and rotation axis,
	 * then returns it.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {vec3} axis the axis around which to rotate
	 * @param {Number} rad the angle in radians
	 * @returns {quat} out
	 **/
	quat.setAxisAngle = function(out, axis, rad) {
	    rad = rad * 0.5;
	    var s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	};
	
	/**
	 * Adds two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 * @function
	 */
	quat.add = vec4.add;
	
	/**
	 * Multiplies two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 */
	quat.multiply = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    out[0] = ax * bw + aw * bx + ay * bz - az * by;
	    out[1] = ay * bw + aw * by + az * bx - ax * bz;
	    out[2] = az * bw + aw * bz + ax * by - ay * bx;
	    out[3] = aw * bw - ax * bx - ay * by - az * bz;
	    return out;
	};
	
	/**
	 * Alias for {@link quat.multiply}
	 * @function
	 */
	quat.mul = quat.multiply;
	
	/**
	 * Scales a quat by a scalar number
	 *
	 * @param {quat} out the receiving vector
	 * @param {quat} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {quat} out
	 * @function
	 */
	quat.scale = vec4.scale;
	
	/**
	 * Rotates a quaternion by the given angle around the X axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateX = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + aw * bx;
	    out[1] = ay * bw + az * bx;
	    out[2] = az * bw - ay * bx;
	    out[3] = aw * bw - ax * bx;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle around the Y axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateY = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        by = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw - az * by;
	    out[1] = ay * bw + aw * by;
	    out[2] = az * bw + ax * by;
	    out[3] = aw * bw - ay * by;
	    return out;
	};
	
	/**
	 * Rotates a quaternion by the given angle around the Z axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateZ = function (out, a, rad) {
	    rad *= 0.5; 
	
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bz = Math.sin(rad), bw = Math.cos(rad);
	
	    out[0] = ax * bw + ay * bz;
	    out[1] = ay * bw - ax * bz;
	    out[2] = az * bw + aw * bz;
	    out[3] = aw * bw - az * bz;
	    return out;
	};
	
	/**
	 * Calculates the W component of a quat from the X, Y, and Z components.
	 * Assumes that quaternion is 1 unit in length.
	 * Any existing W component will be ignored.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate W component of
	 * @returns {quat} out
	 */
	quat.calculateW = function (out, a) {
	    var x = a[0], y = a[1], z = a[2];
	
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	    return out;
	};
	
	/**
	 * Calculates the dot product of two quat's
	 *
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {Number} dot product of a and b
	 * @function
	 */
	quat.dot = vec4.dot;
	
	/**
	 * Performs a linear interpolation between two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 * @function
	 */
	quat.lerp = vec4.lerp;
	
	/**
	 * Performs a spherical linear interpolation between two quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 */
	quat.slerp = function (out, a, b, t) {
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];
	
	    var cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw,
	        halfTheta,
	        sinHalfTheta,
	        ratioA,
	        ratioB;
	
	    if (Math.abs(cosHalfTheta) >= 1.0) {
	        if (out !== a) {
	            out[0] = ax;
	            out[1] = ay;
	            out[2] = az;
	            out[3] = aw;
	        }
	        return out;
	    }
	
	    halfTheta = Math.acos(cosHalfTheta);
	    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
	
	    if (Math.abs(sinHalfTheta) < 0.001) {
	        out[0] = (ax * 0.5 + bx * 0.5);
	        out[1] = (ay * 0.5 + by * 0.5);
	        out[2] = (az * 0.5 + bz * 0.5);
	        out[3] = (aw * 0.5 + bw * 0.5);
	        return out;
	    }
	
	    ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
	    ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
	
	    out[0] = (ax * ratioA + bx * ratioB);
	    out[1] = (ay * ratioA + by * ratioB);
	    out[2] = (az * ratioA + bz * ratioB);
	    out[3] = (aw * ratioA + bw * ratioB);
	
	    return out;
	};
	
	/**
	 * Calculates the inverse of a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate inverse of
	 * @returns {quat} out
	 */
	quat.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
	        invDot = dot ? 1.0/dot : 0;
	    
	    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0
	
	    out[0] = -a0*invDot;
	    out[1] = -a1*invDot;
	    out[2] = -a2*invDot;
	    out[3] = a3*invDot;
	    return out;
	};
	
	/**
	 * Calculates the conjugate of a quat
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate conjugate of
	 * @returns {quat} out
	 */
	quat.conjugate = function (out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a[3];
	    return out;
	};
	
	/**
	 * Calculates the length of a quat
	 *
	 * @param {quat} a vector to calculate length of
	 * @returns {Number} length of a
	 * @function
	 */
	quat.length = vec4.length;
	
	/**
	 * Alias for {@link quat.length}
	 * @function
	 */
	quat.len = quat.length;
	
	/**
	 * Calculates the squared length of a quat
	 *
	 * @param {quat} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 * @function
	 */
	quat.squaredLength = vec4.squaredLength;
	
	/**
	 * Alias for {@link quat.squaredLength}
	 * @function
	 */
	quat.sqrLen = quat.squaredLength;
	
	/**
	 * Normalize a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quaternion to normalize
	 * @returns {quat} out
	 * @function
	 */
	quat.normalize = vec4.normalize;
	
	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {mat3} m rotation matrix
	 * @returns {quat} out
	 * @function
	 */
	quat.fromMat3 = (function() {
	    var s_iNext = [1,2,0];
	    return function(out, m) {
	        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	        // article "Quaternion Calculus and Fast Animation".
	        var fTrace = m[0] + m[4] + m[8];
	        var fRoot;
	
	        if ( fTrace > 0.0 ) {
	            // |w| > 1/2, may as well choose w > 1/2
	            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	            out[3] = 0.5 * fRoot;
	            fRoot = 0.5/fRoot;  // 1/(4w)
	            out[0] = (m[7]-m[5])*fRoot;
	            out[1] = (m[2]-m[6])*fRoot;
	            out[2] = (m[3]-m[1])*fRoot;
	        } else {
	            // |w| <= 1/2
	            var i = 0;
	            if ( m[4] > m[0] )
	              i = 1;
	            if ( m[8] > m[i*3+i] )
	              i = 2;
	            var j = s_iNext[i];
	            var k = s_iNext[j];
	            
	            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
	            out[i] = 0.5 * fRoot;
	            fRoot = 0.5 / fRoot;
	            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
	            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
	            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
	        }
	        
	        return out;
	    };
	})();
	
	/**
	 * Returns a string representation of a quatenion
	 *
	 * @param {quat} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	quat.str = function (a) {
	    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};
	
	if(typeof(exports) !== 'undefined') {
	    exports.quat = quat;
	}
	;
	
	
	
	
	
	
	
	
	
	
	
	
	
	  })(shim.exports);
	})();


/***/ },
/* 10 */
/*!****************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/index.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./shim */ 12);
	__webpack_require__(/*! ./modules/core.dict */ 26);
	__webpack_require__(/*! ./modules/core.iter-helpers */ 13);
	__webpack_require__(/*! ./modules/core.$for */ 14);
	__webpack_require__(/*! ./modules/core.delay */ 15);
	__webpack_require__(/*! ./modules/core.binding */ 16);
	__webpack_require__(/*! ./modules/core.object */ 17);
	__webpack_require__(/*! ./modules/core.array.turn */ 18);
	__webpack_require__(/*! ./modules/core.number.iterator */ 19);
	__webpack_require__(/*! ./modules/core.number.math */ 20);
	__webpack_require__(/*! ./modules/core.string.escape-html */ 21);
	__webpack_require__(/*! ./modules/core.date */ 22);
	__webpack_require__(/*! ./modules/core.global */ 23);
	__webpack_require__(/*! ./modules/core.log */ 24);
	module.exports = __webpack_require__(/*! ./modules/$ */ 25).core;

/***/ },
/* 11 */
/*!**********************************!*\
  !*** ./~/babel-core/polyfill.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./lib/babel/polyfill */ 27);


/***/ },
/* 12 */
/*!***************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/shim.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./modules/es5 */ 28);
	__webpack_require__(/*! ./modules/es6.symbol */ 29);
	__webpack_require__(/*! ./modules/es6.object.assign */ 30);
	__webpack_require__(/*! ./modules/es6.object.is */ 31);
	__webpack_require__(/*! ./modules/es6.object.set-prototype-of */ 32);
	__webpack_require__(/*! ./modules/es6.object.to-string */ 33);
	__webpack_require__(/*! ./modules/es6.object.statics-accept-primitives */ 34);
	__webpack_require__(/*! ./modules/es6.function.name */ 35);
	__webpack_require__(/*! ./modules/es6.number.constructor */ 36);
	__webpack_require__(/*! ./modules/es6.number.statics */ 37);
	__webpack_require__(/*! ./modules/es6.math */ 38);
	__webpack_require__(/*! ./modules/es6.string.from-code-point */ 39);
	__webpack_require__(/*! ./modules/es6.string.raw */ 40);
	__webpack_require__(/*! ./modules/es6.string.iterator */ 41);
	__webpack_require__(/*! ./modules/es6.string.code-point-at */ 42);
	__webpack_require__(/*! ./modules/es6.string.ends-with */ 43);
	__webpack_require__(/*! ./modules/es6.string.includes */ 44);
	__webpack_require__(/*! ./modules/es6.string.repeat */ 45);
	__webpack_require__(/*! ./modules/es6.string.starts-with */ 46);
	__webpack_require__(/*! ./modules/es6.array.from */ 47);
	__webpack_require__(/*! ./modules/es6.array.of */ 48);
	__webpack_require__(/*! ./modules/es6.array.iterator */ 49);
	__webpack_require__(/*! ./modules/es6.array.species */ 50);
	__webpack_require__(/*! ./modules/es6.array.copy-within */ 51);
	__webpack_require__(/*! ./modules/es6.array.fill */ 52);
	__webpack_require__(/*! ./modules/es6.array.find */ 53);
	__webpack_require__(/*! ./modules/es6.array.find-index */ 54);
	__webpack_require__(/*! ./modules/es6.regexp */ 55);
	__webpack_require__(/*! ./modules/es6.promise */ 56);
	__webpack_require__(/*! ./modules/es6.map */ 57);
	__webpack_require__(/*! ./modules/es6.set */ 58);
	__webpack_require__(/*! ./modules/es6.weak-map */ 59);
	__webpack_require__(/*! ./modules/es6.weak-set */ 60);
	__webpack_require__(/*! ./modules/es6.reflect */ 61);
	__webpack_require__(/*! ./modules/es7.array.includes */ 62);
	__webpack_require__(/*! ./modules/es7.string.at */ 63);
	__webpack_require__(/*! ./modules/es7.regexp.escape */ 64);
	__webpack_require__(/*! ./modules/es7.object.get-own-property-descriptors */ 65);
	__webpack_require__(/*! ./modules/es7.object.to-array */ 66);
	__webpack_require__(/*! ./modules/js.array.statics */ 67);
	__webpack_require__(/*! ./modules/web.timers */ 68);
	__webpack_require__(/*! ./modules/web.immediate */ 69);
	__webpack_require__(/*! ./modules/web.dom.iterable */ 70);
	module.exports = __webpack_require__(/*! ./modules/$ */ 25).core;

/***/ },
/* 13 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.iter-helpers.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(/*! ./$ */ 25).core
	  , $iter = __webpack_require__(/*! ./$.iter */ 71);
	core.isIterable  = $iter.is;
	core.getIterator = $iter.get;

/***/ },
/* 14 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.$for.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ctx     = __webpack_require__(/*! ./$.ctx */ 74)
	  , safe    = __webpack_require__(/*! ./$.uid */ 77).safe
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , ENTRIES = safe('entries')
	  , FN      = safe('fn')
	  , ITER    = safe('iter')
	  , forOf          = $iter.forOf
	  , stepCall       = $iter.stepCall
	  , getIterator    = $iter.get
	  , setIterator    = $iter.set
	  , createIterator = $iter.create;
	function $for(iterable, entries){
	  if(!(this instanceof $for))return new $for(iterable, entries);
	  this[ITER]    = getIterator(iterable);
	  this[ENTRIES] = !!entries;
	}
	
	createIterator($for, 'Wrapper', function(){
	  return this[ITER].next();
	});
	var $forProto = $for.prototype;
	setIterator($forProto, function(){
	  return this[ITER]; // unwrap
	});
	
	function createChainIterator(next){
	  function Iterator(iter, fn, that){
	    this[ITER]    = getIterator(iter);
	    this[ENTRIES] = iter[ENTRIES];
	    this[FN]      = ctx(fn, that, iter[ENTRIES] ? 2 : 1);
	  }
	  createIterator(Iterator, 'Chain', next, $forProto);
	  setIterator(Iterator.prototype, $.that); // override $forProto iterator
	  return Iterator;
	}
	
	var MapIter = createChainIterator(function(){
	  var step = this[ITER].next();
	  return step.done
	    ? step
	    : $iter.step(0, stepCall(this[ITER], this[FN], step.value, this[ENTRIES]));
	});
	
	var FilterIter = createChainIterator(function(){
	  for(;;){
	    var step = this[ITER].next();
	    if(step.done || stepCall(this[ITER], this[FN], step.value, this[ENTRIES]))return step;
	  }
	});
	
	$.mix($forProto, {
	  of: function(fn, that){
	    forOf(this, this[ENTRIES], fn, that);
	  },
	  array: function(fn, that){
	    var result = [];
	    forOf(fn != undefined ? this.map(fn, that) : this, false, result.push, result);
	    return result;
	  },
	  filter: function(fn, that){
	    return new FilterIter(this, fn, that);
	  },
	  map: function(fn, that){
	    return new MapIter(this, fn, that);
	  }
	});
	
	$for.isIterable  = $iter.is;
	$for.getIterator = getIterator;
	
	$def($def.G + $def.F, {$for: $for});

/***/ },
/* 15 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.delay.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , partial = __webpack_require__(/*! ./$.partial */ 73);
	// https://esdiscuss.org/topic/promise-returning-delay-function
	$def($def.G + $def.F, {
	  delay: function(time){
	    return new ($.core.Promise || $.g.Promise)(function(resolve){
	      setTimeout(partial.call(resolve, true), time);
	    });
	  }
	});

/***/ },
/* 16 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.binding.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , ctx    = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def   = __webpack_require__(/*! ./$.def */ 72)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , hide   = $.hide
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn
	  // IE8- dirty hack - redefined toLocaleString is not enumerable
	  , _ = $.DESC ? __webpack_require__(/*! ./$.uid */ 77)('tie') : 'toLocaleString'
	  , toLocaleString = {}.toLocaleString;
	
	// Placeholder
	$.core._ = $.path._ = $.path._ || {};
	
	$def($def.P + $def.F, 'Function', {
	  part: __webpack_require__(/*! ./$.partial */ 73),
	  only: function(numberArguments, that /* = @ */){
	    var fn     = assertFunction(this)
	      , n      = $.toLength(numberArguments)
	      , isThat = arguments.length > 1;
	    return function(/* ...args */){
	      var length = Math.min(n, arguments.length)
	        , args   = Array(length)
	        , i      = 0;
	      while(length > i)args[i] = arguments[i++];
	      return invoke(fn, args, isThat ? that : this);
	    };
	  }
	});
	
	function tie(key){
	  var that  = this
	    , bound = {};
	  return hide(that, _, function(key){ // eslint-disable-line no-shadow
	    if(key === undefined || !(key in that))return toLocaleString.call(that);
	    return $.has(bound, key) ? bound[key] : bound[key] = ctx(that[key], that, -1);
	  })[_](key);
	}
	
	hide($.path._, 'toString', function(){
	  return _;
	});
	
	hide(Object.prototype, _, tie);
	$.DESC || hide(Array.prototype, _, tie);

/***/ },
/* 17 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.object.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , ownKeys = __webpack_require__(/*! ./$.own-keys */ 78);
	function define(target, mixin){
	  var keys   = ownKeys($.toObject(mixin))
	    , length = keys.length
	    , i = 0, key;
	  while(length > i)$.setDesc(target, key = keys[i++], $.getDesc(mixin, key));
	  return target;
	}
	$def($def.S + $def.F, 'Object', {
	  isObject: $.isObject,
	  classof: __webpack_require__(/*! ./$.cof */ 79).classof,
	  define: define,
	  make: function(proto, mixin){
	    return define($.create(proto), mixin);
	  }
	});

/***/ },
/* 18 */
/*!**********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.array.turn.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(/*! ./$ */ 25)
	  , $def           = __webpack_require__(/*! ./$.def */ 72)
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	$def($def.P + $def.F, 'Array', {
	  turn: function(fn, target /* = [] */){
	    assertFunction(fn);
	    var memo   = target == undefined ? [] : Object(target)
	      , O      = $.ES5Object(this)
	      , length = $.toLength(O.length)
	      , index  = 0;
	    while(length > index)if(fn(memo, O[index], index++, this) === false)break;
	    return memo;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('turn');

/***/ },
/* 19 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.number.iterator.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ITER    = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , step    = $iter.step
	  , NUMBER  = 'Number';
	function NumberIterator(iterated){
	  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
	}
	$iter.create(NumberIterator, NUMBER, function(){
	  var iter = this[ITER]
	    , i    = iter.i++;
	  return i < iter.l ? step(0, i) : step(1);
	});
	$iter.define(Number, NUMBER, function(){
	  return new NumberIterator(this);
	});

/***/ },
/* 20 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.number.math.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , invoke  = __webpack_require__(/*! ./$.invoke */ 75)
	  , methods = {};
	
	methods.random = function(lim /* = 0 */){
	  var a = +this
	    , b = lim == undefined ? 0 : +lim
	    , m = Math.min(a, b);
	  return Math.random() * (Math.max(a, b) - m) + m;
	};
	
	if($.FW)$.each.call((
	    // ES3:
	    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
	    // ES6:
	    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
	  ).split(','), function(key){
	    var fn = Math[key];
	    if(fn)methods[key] = function(/* ...args */){
	      // ie9- dont support strict mode & convert `this` to object -> convert it to number
	      var args = [+this]
	        , i    = 0;
	      while(arguments.length > i)args.push(arguments[i++]);
	      return invoke(fn, args);
	    };
	  }
	);
	
	$def($def.P + $def.F, 'Number', methods);

/***/ },
/* 21 */
/*!******************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.string.escape-html.js ***!
  \******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def     = __webpack_require__(/*! ./$.def */ 72)
	  , replacer = __webpack_require__(/*! ./$.replacer */ 81);
	var escapeHTMLDict = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&apos;'
	}, unescapeHTMLDict = {}, key;
	for(key in escapeHTMLDict)unescapeHTMLDict[escapeHTMLDict[key]] = key;
	$def($def.P + $def.F, 'String', {
	  escapeHTML:   replacer(/[&<>"']/g, escapeHTMLDict),
	  unescapeHTML: replacer(/&(?:amp|lt|gt|quot|apos);/g, unescapeHTMLDict)
	});

/***/ },
/* 22 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.date.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $            = __webpack_require__(/*! ./$ */ 25)
	  , $def         = __webpack_require__(/*! ./$.def */ 72)
	  , core         = $.core
	  , formatRegExp = /\b\w\w?\b/g
	  , flexioRegExp = /:(.*)\|(.*)$/
	  , locales      = {}
	  , current      = 'en'
	  , SECONDS      = 'Seconds'
	  , MINUTES      = 'Minutes'
	  , HOURS        = 'Hours'
	  , DATE         = 'Date'
	  , MONTH        = 'Month'
	  , YEAR         = 'FullYear';
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	function createFormat(prefix){
	  return function(template, locale /* = current */){
	    var that = this
	      , dict = locales[$.has(locales, locale) ? locale : current];
	    function get(unit){
	      return that[prefix + unit]();
	    }
	    return String(template).replace(formatRegExp, function(part){
	      switch(part){
	        case 's'  : return get(SECONDS);                  // Seconds : 0-59
	        case 'ss' : return lz(get(SECONDS));              // Seconds : 00-59
	        case 'm'  : return get(MINUTES);                  // Minutes : 0-59
	        case 'mm' : return lz(get(MINUTES));              // Minutes : 00-59
	        case 'h'  : return get(HOURS);                    // Hours   : 0-23
	        case 'hh' : return lz(get(HOURS));                // Hours   : 00-23
	        case 'D'  : return get(DATE);                     // Date    : 1-31
	        case 'DD' : return lz(get(DATE));                 // Date    : 01-31
	        case 'W'  : return dict[0][get('Day')];           // Day     : Понедельник
	        case 'N'  : return get(MONTH) + 1;                // Month   : 1-12
	        case 'NN' : return lz(get(MONTH) + 1);            // Month   : 01-12
	        case 'M'  : return dict[2][get(MONTH)];           // Month   : Январь
	        case 'MM' : return dict[1][get(MONTH)];           // Month   : Января
	        case 'Y'  : return get(YEAR);                     // Year    : 2014
	        case 'YY' : return lz(get(YEAR) % 100);           // Year    : 14
	      } return part;
	    });
	  };
	}
	function addLocale(lang, locale){
	  function split(index){
	    var result = [];
	    $.each.call(locale.months.split(','), function(it){
	      result.push(it.replace(flexioRegExp, '$' + index));
	    });
	    return result;
	  }
	  locales[lang] = [locale.weekdays.split(','), split(1), split(2)];
	  return core;
	}
	$def($def.P + $def.F, DATE, {
	  format:    createFormat('get'),
	  formatUTC: createFormat('getUTC')
	});
	addLocale(current, {
	  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	  months: 'January,February,March,April,May,June,July,August,September,October,November,December'
	});
	addLocale('ru', {
	  weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
	  months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,' +
	          'Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
	});
	core.locale = function(locale){
	  return $.has(locales, locale) ? current = locale : current;
	};
	core.addLocale = addLocale;

/***/ },
/* 23 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.global.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.G + $def.F, {global: __webpack_require__(/*! ./$ */ 25).g});

/***/ },
/* 24 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.log.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72)
	  , log  = {}
	  , enabled = true;
	// Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
	$.each.call(('assert,clear,count,debug,dir,dirxml,error,exception,' +
	    'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
	    'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
	    'timelineEnd,timeStamp,trace,warn').split(','), function(key){
	  log[key] = function(){
	    if(enabled && $.g.console && $.isFunction(console[key])){
	      return Function.apply.call(console[key], console, arguments);
	    }
	  };
	});
	$def($def.G + $def.F, {log: __webpack_require__(/*! ./$.assign */ 82)(log.log, log, {
	  enable: function(){
	    enabled = true;
	  },
	  disable: function(){
	    enabled = false;
	  }
	})});

/***/ },
/* 25 */
/*!********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global = typeof self != 'undefined' ? self : Function('return this')()
	  , core   = {}
	  , defineProperty = Object.defineProperty
	  , hasOwnProperty = {}.hasOwnProperty
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , max   = Math.max
	  , min   = Math.min;
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	  try {
	    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
	  } catch(e){ /* empty */ }
	}();
	var hide = createDefiner(1);
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	}
	function desc(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
	  } : simpleSet;
	}
	
	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	}
	
	var $ = module.exports = __webpack_require__(/*! ./$.fw */ 84)({
	  g: global,
	  core: core,
	  html: global.document && document.documentElement,
	  // http://jsperf.com/core-js-isobject
	  isObject:   isObject,
	  isFunction: isFunction,
	  it: function(it){
	    return it;
	  },
	  that: function(){
	    return this;
	  },
	  // 7.1.4 ToInteger
	  toInteger: toInteger,
	  // 7.1.15 ToLength
	  toLength: function(it){
	    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	  },
	  toIndex: function(index, length){
	    index = toInteger(index);
	    return index < 0 ? max(index + length, 0) : min(index, length);
	  },
	  has: function(it, key){
	    return hasOwnProperty.call(it, key);
	  },
	  create:     Object.create,
	  getProto:   Object.getPrototypeOf,
	  DESC:       DESC,
	  desc:       desc,
	  getDesc:    Object.getOwnPropertyDescriptor,
	  setDesc:    defineProperty,
	  getKeys:    Object.keys,
	  getNames:   Object.getOwnPropertyNames,
	  getSymbols: Object.getOwnPropertySymbols,
	  // Dummy, fix for not array-like ES3 string in es5 module
	  assertDefined: assertDefined,
	  ES5Object: Object,
	  toObject: function(it){
	    return $.ES5Object(assertDefined(it));
	  },
	  hide: hide,
	  def: createDefiner(0),
	  set: global.Symbol ? simpleSet : hide,
	  mix: function(target, src){
	    for(var key in src)hide(target, key, src[key]);
	    return target;
	  },
	  each: [].forEach
	});
	if(typeof __e != 'undefined')__e = core;
	if(typeof __g != 'undefined')__g = global;

/***/ },
/* 26 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/core.dict.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , ctx      = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , assign   = __webpack_require__(/*! ./$.assign */ 82)
	  , keyOf    = __webpack_require__(/*! ./$.keyof */ 83)
	  , ITER     = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , assert   = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter    = __webpack_require__(/*! ./$.iter */ 71)
	  , step     = $iter.step
	  , getKeys  = $.getKeys
	  , toObject = $.toObject
	  , has      = $.has;
	
	function Dict(iterable){
	  var dict = $.create(null);
	  if(iterable != undefined){
	    if($iter.is(iterable)){
	      $iter.forOf(iterable, true, function(key, value){
	        dict[key] = value;
	      });
	    } else assign(dict, iterable);
	  }
	  return dict;
	}
	Dict.prototype = null;
	
	function DictIterator(iterated, kind){
	  $.set(this, ITER, {o: toObject(iterated), a: getKeys(iterated), i: 0, k: kind});
	}
	$iter.create(DictIterator, 'Dict', function(){
	  var iter = this[ITER]
	    , O    = iter.o
	    , keys = iter.a
	    , kind = iter.k
	    , key;
	  do {
	    if(iter.i >= keys.length){
	      iter.o = undefined;
	      return step(1);
	    }
	  } while(!has(O, key = keys[iter.i++]));
	  if(kind == 'key'  )return step(0, key);
	  if(kind == 'value')return step(0, O[key]);
	  return step(0, [key, O[key]]);
	});
	function createDictIter(kind){
	  return function(it){
	    return new DictIterator(it, kind);
	  };
	}
	function generic(A, B){
	  // strange IE quirks mode bug -> use typeof instead of isFunction
	  return typeof A == 'function' ? A : B;
	}
	
	// 0 -> Dict.forEach
	// 1 -> Dict.map
	// 2 -> Dict.filter
	// 3 -> Dict.some
	// 4 -> Dict.every
	// 5 -> Dict.find
	// 6 -> Dict.findKey
	// 7 -> Dict.mapPairs
	function createDictMethod(TYPE){
	  var IS_MAP   = TYPE == 1
	    , IS_EVERY = TYPE == 4;
	  return function(object, callbackfn, that /* = undefined */){
	    var f      = ctx(callbackfn, that, 3)
	      , O      = toObject(object)
	      , result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined
	      , key, val, res;
	    for(key in O)if(has(O, key)){
	      val = O[key];
	      res = f(val, key, object);
	      if(TYPE){
	        if(IS_MAP)result[key] = res;            // map
	        else if(res)switch(TYPE){
	          case 2: result[key] = val; break;     // filter
	          case 3: return true;                  // some
	          case 5: return val;                   // find
	          case 6: return key;                   // findKey
	          case 7: result[res[0]] = res[1];      // mapPairs
	        } else if(IS_EVERY)return false;        // every
	      }
	    }
	    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
	  };
	}
	
	// true  -> Dict.turn
	// false -> Dict.reduce
	function createDictReduce(IS_TURN){
	  return function(object, mapfn, init){
	    assert.fn(mapfn);
	    var O      = toObject(object)
	      , keys   = getKeys(O)
	      , length = keys.length
	      , i      = 0
	      , memo, key, result;
	    if(IS_TURN){
	      memo = init == undefined ? new (generic(this, Dict)) : Object(init);
	    } else if(arguments.length < 3){
	      assert(length, 'Reduce of empty object with no initial value');
	      memo = O[keys[i++]];
	    } else memo = Object(init);
	    while(length > i)if(has(O, key = keys[i++])){
	      result = mapfn(memo, O[key], key, object);
	      if(IS_TURN){
	        if(result === false)break;
	      } else memo = result;
	    }
	    return memo;
	  };
	}
	var findKey = createDictMethod(6);
	
	$def($def.G + $def.F, {Dict: $.mix(Dict, {
	  keys:     createDictIter('key'),
	  values:   createDictIter('value'),
	  entries:  createDictIter('key+value'),
	  forEach:  createDictMethod(0),
	  map:      createDictMethod(1),
	  filter:   createDictMethod(2),
	  some:     createDictMethod(3),
	  every:    createDictMethod(4),
	  find:     createDictMethod(5),
	  findKey:  findKey,
	  mapPairs: createDictMethod(7),
	  reduce:   createDictReduce(false),
	  turn:     createDictReduce(true),
	  keyOf:    keyOf,
	  includes: function(object, el){
	    return (el == el ? keyOf(object, el) : findKey(object, function(it){
	      return it != it;
	    })) !== undefined;
	  },
	  // Has / get / set own property
	  has: has,
	  get: function(object, key){
	    if(has(object, key))return object[key];
	  },
	  set: $.def,
	  isDict: function(it){
	    return $.isObject(it) && $.getProto(it) === Dict.prototype;
	  }
	})});

/***/ },
/* 27 */
/*!********************************************!*\
  !*** ./~/babel-core/lib/babel/polyfill.js ***!
  \********************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	if (global._babelPolyfill) {
	  throw new Error("only one instance of babel/polyfill is allowed");
	}
	global._babelPolyfill = true;
	
	__webpack_require__(/*! core-js/shim */ 96);
	
	__webpack_require__(/*! regenerator-babel/runtime */ 95);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 28 */
/*!**********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es5.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $                = __webpack_require__(/*! ./$ */ 25)
	  , cof              = __webpack_require__(/*! ./$.cof */ 79)
	  , $def             = __webpack_require__(/*! ./$.def */ 72)
	  , invoke           = __webpack_require__(/*! ./$.invoke */ 75)
	  , arrayMethod      = __webpack_require__(/*! ./$.array-methods */ 86)
	  , IE_PROTO         = __webpack_require__(/*! ./$.uid */ 77).safe('__proto__')
	  , assert           = __webpack_require__(/*! ./$.assert */ 76)
	  , assertObject     = assert.obj
	  , ObjectProto      = Object.prototype
	  , A                = []
	  , slice            = A.slice
	  , indexOf          = A.indexOf
	  , classof          = cof.classof
	  , defineProperties = Object.defineProperties
	  , has              = $.has
	  , defineProperty   = $.setDesc
	  , getOwnDescriptor = $.getDesc
	  , isFunction       = $.isFunction
	  , toObject         = $.toObject
	  , toLength         = $.toLength
	  , IE8_DOM_DEFINE   = false;
	
	if(!$.DESC){
	  try {
	    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
	      {get: function(){ return 8; }}
	    ).x == 8;
	  } catch(e){ /* empty */ }
	  $.setDesc = function(O, P, Attributes){
	    if(IE8_DOM_DEFINE)try {
	      return defineProperty(O, P, Attributes);
	    } catch(e){ /* empty */ }
	    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
	    return O;
	  };
	  $.getDesc = function(O, P){
	    if(IE8_DOM_DEFINE)try {
	      return getOwnDescriptor(O, P);
	    } catch(e){ /* empty */ }
	    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
	  };
	  defineProperties = function(O, Properties){
	    assertObject(O);
	    var keys   = $.getKeys(Properties)
	      , length = keys.length
	      , i = 0
	      , P;
	    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
	    return O;
	  };
	}
	$def($def.S + $def.F * !$.DESC, 'Object', {
	  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $.getDesc,
	  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	  defineProperty: $.setDesc,
	  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
	  defineProperties: defineProperties
	});
	
	  // IE 8- don't enum bug keys
	var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
	            'toLocaleString,toString,valueOf').split(',')
	  // Additional keys for getOwnPropertyNames
	  , keys2 = keys1.concat('length', 'prototype')
	  , keysLen1 = keys1.length;
	
	// Create object with `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = document.createElement('iframe')
	    , i      = keysLen1
	    , iframeDocument;
	  iframe.style.display = 'none';
	  $.html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script>');
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict.prototype[keys1[i]];
	  return createDict();
	};
	function createGetKeys(names, length){
	  return function(object){
	    var O      = toObject(object)
	      , i      = 0
	      , result = []
	      , key;
	    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	    // Don't enum bug & hidden keys
	    while(length > i)if(has(O, key = names[i++])){
	      ~indexOf.call(result, key) || result.push(key);
	    }
	    return result;
	  };
	}
	function isPrimitive(it){ return !$.isObject(it); }
	function Empty(){}
	$def($def.S, 'Object', {
	  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	  getPrototypeOf: $.getProto = $.getProto || function(O){
	    O = Object(assert.def(O));
	    if(has(O, IE_PROTO))return O[IE_PROTO];
	    if(isFunction(O.constructor) && O instanceof O.constructor){
	      return O.constructor.prototype;
	    } return O instanceof Object ? ObjectProto : null;
	  },
	  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
	  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	  create: $.create = $.create || function(O, /*?*/Properties){
	    var result;
	    if(O !== null){
	      Empty.prototype = assertObject(O);
	      result = new Empty();
	      Empty.prototype = null;
	      // add "__proto__" for Object.getPrototypeOf shim
	      result[IE_PROTO] = O;
	    } else result = createDict();
	    return Properties === undefined ? result : defineProperties(result, Properties);
	  },
	  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
	  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
	  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
	  seal: $.it, // <- cap
	  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
	  freeze: $.it, // <- cap
	  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
	  preventExtensions: $.it, // <- cap
	  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
	  isSealed: isPrimitive, // <- cap
	  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
	  isFrozen: isPrimitive, // <- cap
	  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
	  isExtensible: $.isObject // <- cap
	});
	
	// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
	$def($def.P, 'Function', {
	  bind: function(that /*, args... */){
	    var fn       = assert.fn(this)
	      , partArgs = slice.call(arguments, 1);
	    function bound(/* args... */){
	      var args = partArgs.concat(slice.call(arguments));
	      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
	    }
	    if(fn.prototype)bound.prototype = fn.prototype;
	    return bound;
	  }
	});
	
	// Fix for not array-like ES3 string
	function arrayMethodFix(fn){
	  return function(){
	    return fn.apply($.ES5Object(this), arguments);
	  };
	}
	if(!(0 in Object('z') && 'z'[0] == 'z')){
	  $.ES5Object = function(it){
	    return cof(it) == 'String' ? it.split('') : Object(it);
	  };
	}
	$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
	  slice: arrayMethodFix(slice),
	  join: arrayMethodFix(A.join)
	});
	
	// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
	$def($def.S, 'Array', {
	  isArray: function(arg){
	    return cof(arg) == 'Array';
	  }
	});
	function createArrayReduce(isRight){
	  return function(callbackfn, memo){
	    assert.fn(callbackfn);
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = isRight ? length - 1 : 0
	      , i      = isRight ? -1 : 1;
	    if(arguments.length < 2)for(;;){
	      if(index in O){
	        memo = O[index];
	        index += i;
	        break;
	      }
	      index += i;
	      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
	    }
	    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
	      memo = callbackfn(memo, O[index], index, this);
	    }
	    return memo;
	  };
	}
	$def($def.P, 'Array', {
	  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
	  forEach: $.each = $.each || arrayMethod(0),
	  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
	  map: arrayMethod(1),
	  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
	  filter: arrayMethod(2),
	  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
	  some: arrayMethod(3),
	  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
	  every: arrayMethod(4),
	  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
	  reduce: createArrayReduce(false),
	  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
	  reduceRight: createArrayReduce(true),
	  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
	  indexOf: indexOf = indexOf || __webpack_require__(/*! ./$.array-includes */ 87)(false),
	  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
	  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = length - 1;
	    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
	    if(index < 0)index = toLength(length + index);
	    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
	    return -1;
	  }
	});
	
	// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
	$def($def.P, 'String', {trim: __webpack_require__(/*! ./$.replacer */ 81)(/^\s*([\s\S]*\S)?\s*$/, '$1')});
	
	// 20.3.3.1 / 15.9.4.4 Date.now()
	$def($def.S, 'Date', {now: function(){
	  return +new Date;
	}});
	
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
	$def($def.P, 'Date', {toISOString: function(){
	  if(!isFinite(this))throw RangeError('Invalid time value');
	  var d = this
	    , y = d.getUTCFullYear()
	    , m = d.getUTCMilliseconds()
	    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
	  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
	    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
	    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
	    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
	}});
	
	if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
	  var tag = classof(it);
	  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
	};

/***/ },
/* 29 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.symbol.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $        = __webpack_require__(/*! ./$ */ 25)
	  , setTag   = __webpack_require__(/*! ./$.cof */ 79).set
	  , uid      = __webpack_require__(/*! ./$.uid */ 77)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , keyOf    = __webpack_require__(/*! ./$.keyof */ 83)
	  , has      = $.has
	  , hide     = $.hide
	  , getNames = $.getNames
	  , toObject = $.toObject
	  , Symbol   = $.g.Symbol
	  , Base     = Symbol
	  , setter   = false
	  , TAG      = uid.safe('tag')
	  , SymbolRegistry = {}
	  , AllSymbols     = {};
	
	function wrap(tag){
	  var sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
	  $.DESC && setter && $.setDesc(Object.prototype, tag, {
	    configurable: true,
	    set: function(value){
	      hide(this, tag, value);
	    }
	  });
	  return sym;
	}
	
	// 19.4.1.1 Symbol([description])
	if(!$.isFunction(Symbol)){
	  Symbol = function(description){
	    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
	    return wrap(uid(description));
	  };
	  hide(Symbol.prototype, 'toString', function(){
	    return this[TAG];
	  });
	}
	$def($def.G + $def.W, {Symbol: Symbol});
	
	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  pure: uid.safe,
	  set: $.set,
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	    'species,split,toPrimitive,toStringTag,unscopables'
	  ).split(','), function(it){
	    var sym = __webpack_require__(/*! ./$.wks */ 85)(it);
	    symbolStatics[it] = Symbol === Base ? sym : wrap(sym);
	  }
	);
	
	setter = true;
	
	$def($def.S, 'Symbol', symbolStatics);
	
	$def($def.S + $def.F * (Symbol != Base), 'Object', {
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
	    return result;
	  },
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
	    return result;
	  }
	});
	
	setTag(Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setTag($.g.JSON, 'JSON', true);

/***/ },
/* 30 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.assign.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {assign: __webpack_require__(/*! ./$.assign */ 82)});

/***/ },
/* 31 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.is.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.10 Object.is(value1, value2)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {
	  is: function(x, y){
	    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	  }
	});

/***/ },
/* 32 */
/*!**********************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.set-prototype-of.js ***!
  \**********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(/*! ./$.set-proto */ 88)});

/***/ },
/* 33 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.to-string.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.3.6 Object.prototype.toString()
	var $   = __webpack_require__(/*! ./$ */ 25)
	  , cof = __webpack_require__(/*! ./$.cof */ 79)
	  , tmp = {};
	tmp[__webpack_require__(/*! ./$.wks */ 85)('toStringTag')] = 'z';
	if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
	  return '[object ' + cof.classof(this) + ']';
	});

/***/ },
/* 34 */
/*!*******************************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.object.statics-accept-primitives.js ***!
  \*******************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , $def     = __webpack_require__(/*! ./$.def */ 72)
	  , isObject = $.isObject
	  , toObject = $.toObject;
	function wrapObjectMethod(METHOD, MODE){
	  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
	    , f   = 0
	    , o   = {};
	  o[METHOD] = MODE == 1 ? function(it){
	    return isObject(it) ? fn(it) : it;
	  } : MODE == 2 ? function(it){
	    return isObject(it) ? fn(it) : true;
	  } : MODE == 3 ? function(it){
	    return isObject(it) ? fn(it) : false;
	  } : MODE == 4 ? function(it, key){
	    return fn(toObject(it), key);
	  } : MODE == 5 ? function(it){
	    return fn(Object($.assertDefined(it)));
	  } : function(it){
	    return fn(toObject(it));
	  };
	  try {
	    fn('z');
	  } catch(e){
	    f = 1;
	  }
	  $def($def.S + $def.F * f, 'Object', o);
	}
	wrapObjectMethod('freeze', 1);
	wrapObjectMethod('seal', 1);
	wrapObjectMethod('preventExtensions', 1);
	wrapObjectMethod('isFrozen', 2);
	wrapObjectMethod('isSealed', 2);
	wrapObjectMethod('isExtensible', 3);
	wrapObjectMethod('getOwnPropertyDescriptor', 4);
	wrapObjectMethod('getPrototypeOf', 5);
	wrapObjectMethod('keys');
	wrapObjectMethod('getOwnPropertyNames');

/***/ },
/* 35 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.function.name.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , NAME = 'name'
	  , setDesc = $.setDesc
	  , FunctionProto = Function.prototype;
	// 19.2.4.2 name
	NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
	  configurable: true,
	  get: function(){
	    var match = String(this).match(/^\s*function ([^ (]*)/)
	      , name  = match ? match[1] : '';
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
	    return name;
	  },
	  set: function(value){
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
	  }
	});

/***/ },
/* 36 */
/*!*****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.number.constructor.js ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $          = __webpack_require__(/*! ./$ */ 25)
	  , isObject   = $.isObject
	  , isFunction = $.isFunction
	  , NUMBER     = 'Number'
	  , Number     = $.g[NUMBER]
	  , Base       = Number
	  , proto      = Number.prototype;
	function toPrimitive(it){
	  var fn, val;
	  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
	  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to number");
	}
	function toNumber(it){
	  if(isObject(it))it = toPrimitive(it);
	  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
	    var binary = false;
	    switch(it.charCodeAt(1)){
	      case 66 : case 98  : binary = true;
	      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
	    }
	  } return +it;
	}
	if($.FW && !(Number('0o1') && Number('0b1'))){
	  Number = function Number(it){
	    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
	  };
	  $.each.call($.DESC ? $.getNames(Base) : (
	      // ES3:
	      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	      // ES6 (in case, if modules with ES6 Number statics required before):
	      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	    ).split(','), function(key){
	      if($.has(Base, key) && !$.has(Number, key)){
	        $.setDesc(Number, key, $.getDesc(Base, key));
	      }
	    }
	  );
	  Number.prototype = proto;
	  proto.constructor = Number;
	  $.hide($.g, NUMBER, Number);
	}

/***/ },
/* 37 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.number.statics.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 25)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , abs   = Math.abs
	  , floor = Math.floor
	  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
	function isInteger(it){
	  return !$.isObject(it) && isFinite(it) && floor(it) === it;
	}
	$def($def.S, 'Number', {
	  // 20.1.2.1 Number.EPSILON
	  EPSILON: Math.pow(2, -52),
	  // 20.1.2.2 Number.isFinite(number)
	  isFinite: function(it){
	    return typeof it == 'number' && isFinite(it);
	  },
	  // 20.1.2.3 Number.isInteger(number)
	  isInteger: isInteger,
	  // 20.1.2.4 Number.isNaN(number)
	  isNaN: function(number){
	    return number != number;
	  },
	  // 20.1.2.5 Number.isSafeInteger(number)
	  isSafeInteger: function(number){
	    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
	  },
	  // 20.1.2.6 Number.MAX_SAFE_INTEGER
	  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
	  // 20.1.2.10 Number.MIN_SAFE_INTEGER
	  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
	  // 20.1.2.12 Number.parseFloat(string)
	  parseFloat: parseFloat,
	  // 20.1.2.13 Number.parseInt(string, radix)
	  parseInt: parseInt
	});

/***/ },
/* 38 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.math.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Infinity = 1 / 0
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , E     = Math.E
	  , pow   = Math.pow
	  , abs   = Math.abs
	  , exp   = Math.exp
	  , log   = Math.log
	  , sqrt  = Math.sqrt
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , sign  = Math.sign || function(x){
	      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	    };
	
	// 20.2.2.5 Math.asinh(x)
	function asinh(x){
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
	}
	// 20.2.2.14 Math.expm1(x)
	function expm1(x){
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
	}
	
	$def($def.S, 'Math', {
	  // 20.2.2.3 Math.acosh(x)
	  acosh: function(x){
	    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
	  },
	  // 20.2.2.5 Math.asinh(x)
	  asinh: asinh,
	  // 20.2.2.7 Math.atanh(x)
	  atanh: function(x){
	    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
	  },
	  // 20.2.2.9 Math.cbrt(x)
	  cbrt: function(x){
	    return sign(x = +x) * pow(abs(x), 1 / 3);
	  },
	  // 20.2.2.11 Math.clz32(x)
	  clz32: function(x){
	    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
	  },
	  // 20.2.2.12 Math.cosh(x)
	  cosh: function(x){
	    return (exp(x = +x) + exp(-x)) / 2;
	  },
	  // 20.2.2.14 Math.expm1(x)
	  expm1: expm1,
	  // 20.2.2.16 Math.fround(x)
	  // TODO: fallback for IE9-
	  fround: function(x){
	    return new Float32Array([x])[0];
	  },
	  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
	  hypot: function(value1, value2){ // eslint-disable-line no-unused-vars
	    var sum  = 0
	      , len1 = arguments.length
	      , len2 = len1
	      , args = Array(len1)
	      , larg = -Infinity
	      , arg;
	    while(len1--){
	      arg = args[len1] = +arguments[len1];
	      if(arg == Infinity || arg == -Infinity)return Infinity;
	      if(arg > larg)larg = arg;
	    }
	    larg = arg || 1;
	    while(len2--)sum += pow(args[len2] / larg, 2);
	    return larg * sqrt(sum);
	  },
	  // 20.2.2.18 Math.imul(x, y)
	  imul: function(x, y){
	    var UInt16 = 0xffff
	      , xn = +x
	      , yn = +y
	      , xl = UInt16 & xn
	      , yl = UInt16 & yn;
	    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
	  },
	  // 20.2.2.20 Math.log1p(x)
	  log1p: function(x){
	    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
	  },
	  // 20.2.2.21 Math.log10(x)
	  log10: function(x){
	    return log(x) / Math.LN10;
	  },
	  // 20.2.2.22 Math.log2(x)
	  log2: function(x){
	    return log(x) / Math.LN2;
	  },
	  // 20.2.2.28 Math.sign(x)
	  sign: sign,
	  // 20.2.2.30 Math.sinh(x)
	  sinh: function(x){
	    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
	  },
	  // 20.2.2.33 Math.tanh(x)
	  tanh: function(x){
	    var a = expm1(x = +x)
	      , b = expm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
	  },
	  // 20.2.2.34 Math.trunc(x)
	  trunc: function(it){
	    return (it > 0 ? floor : ceil)(it);
	  }
	});

/***/ },
/* 39 */
/*!*********************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.from-code-point.js ***!
  \*********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = __webpack_require__(/*! ./$ */ 25).toIndex
	  , fromCharCode = String.fromCharCode;
	
	$def($def.S, 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function(x){ // eslint-disable-line no-unused-vars
	    var res = []
	      , len = arguments.length
	      , i   = 0
	      , code;
	    while(len > i){
	      code = +arguments[i++];
	      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

/***/ },
/* 40 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.raw.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.S, 'String', {
	  // 21.1.2.4 String.raw(callSite, ...substitutions)
	  raw: function(callSite){
	    var raw = $.toObject(callSite.raw)
	      , len = $.toLength(raw.length)
	      , sln = arguments.length
	      , res = []
	      , i   = 0;
	    while(len > i){
	      res.push(String(raw[i++]));
	      if(i < sln)res.push(String(arguments[i]));
	    } return res.join('');
	  }
	});

/***/ },
/* 41 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.iterator.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var set   = __webpack_require__(/*! ./$ */ 25).set
	  , at    = __webpack_require__(/*! ./$.string-at */ 89)(true)
	  , ITER  = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , step  = $iter.step;
	
	// 21.1.3.27 String.prototype[@@iterator]()
	$iter.std(String, 'String', function(iterated){
	  set(this, ITER, {o: String(iterated), i: 0});
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , index = iter.i
	    , point;
	  if(index >= O.length)return step(1);
	  point = at.call(O, index);
	  iter.i += point.length;
	  return step(0, point);
	});

/***/ },
/* 42 */
/*!*******************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.code-point-at.js ***!
  \*******************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: __webpack_require__(/*! ./$.string-at */ 89)(false)
	});

/***/ },
/* 43 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.ends-with.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72)
	  , toLength = $.toLength;
	
	$def($def.P, 'String', {
	  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
	  endsWith: function(searchString /*, endPosition = @length */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that = String($.assertDefined(this))
	      , endPosition = arguments[1]
	      , len = toLength(that.length)
	      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
	    searchString += '';
	    return that.slice(end - searchString.length, end) === searchString;
	  }
	});

/***/ },
/* 44 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.includes.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
	  includes: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
	  }
	});

/***/ },
/* 45 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.repeat.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: function(count){
	    var str = String($.assertDefined(this))
	      , res = ''
	      , n   = $.toInteger(count);
	    if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
	    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
	    return res;
	  }
	});

/***/ },
/* 46 */
/*!*****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.string.starts-with.js ***!
  \*****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , cof  = __webpack_require__(/*! ./$.cof */ 79)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	
	$def($def.P, 'String', {
	  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
	  startsWith: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that  = String($.assertDefined(this))
	      , index = $.toLength(Math.min(arguments[1], that.length));
	    searchString += '';
	    return that.slice(index, index + searchString.length) === searchString;
	  }
	});

/***/ },
/* 47 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.from.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 25)
	  , ctx   = __webpack_require__(/*! ./$.ctx */ 74)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , stepCall = $iter.stepCall;
	$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = Object($.assertDefined(arrayLike))
	      , mapfn   = arguments[1]
	      , mapping = mapfn !== undefined
	      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
	      , index   = 0
	      , length, result, step, iterator;
	    if($iter.is(O)){
	      iterator = $iter.get(O);
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result   = new (typeof this == 'function' ? this : Array);
	      for(; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
	      }
	    } else {
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
	      for(; length > index; index++){
	        result[index] = mapping ? f(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});

/***/ },
/* 48 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.of.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'Array', {
	  // 22.1.2.3 Array.of( ...items)
	  of: function(/* ...args */){
	    var index  = 0
	      , length = arguments.length
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      , result = new (typeof this == 'function' ? this : Array)(length);
	    while(length > index)result[index] = arguments[index++];
	    result.length = length;
	    return result;
	  }
	});

/***/ },
/* 49 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.iterator.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 25)
	  , setUnscope = __webpack_require__(/*! ./$.unscope */ 80)
	  , ITER       = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , $iter      = __webpack_require__(/*! ./$.iter */ 71)
	  , step       = $iter.step
	  , Iterators  = $iter.Iterators;
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	$iter.std(Array, 'Array', function(iterated, kind){
	  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , kind  = iter.k
	    , index = iter.i++;
	  if(!O || index >= O.length){
	    iter.o = undefined;
	    return step(1);
	  }
	  if(kind == 'key'  )return step(0, index);
	  if(kind == 'value')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'value');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 50 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.species.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./$.species */ 90)(Array);

/***/ },
/* 51 */
/*!****************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.copy-within.js ***!
  \****************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	  copyWithin: function(target/* = 0 */, start /* = 0, end = @length */){
	    var O     = Object($.assertDefined(this))
	      , len   = $.toLength(O.length)
	      , to    = toIndex(target, len)
	      , from  = toIndex(start, len)
	      , end   = arguments[2]
	      , fin   = end === undefined ? len : toIndex(end, len)
	      , count = Math.min(fin - from, len - to)
	      , inc   = 1;
	    if(from < to && to < from + count){
	      inc  = -1;
	      from = from + count - 1;
	      to   = to   + count - 1;
	    }
	    while(count-- > 0){
	      if(from in O)O[to] = O[from];
	      else delete O[to];
	      to   += inc;
	      from += inc;
	    } return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('copyWithin');

/***/ },
/* 52 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.fill.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	  fill: function(value /*, start = 0, end = @length */){
	    var O      = Object($.assertDefined(this))
	      , length = $.toLength(O.length)
	      , index  = toIndex(arguments[1], length)
	      , end    = arguments[2]
	      , endPos = end === undefined ? length : toIndex(end, length);
	    while(endPos > index)O[index++] = value;
	    return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 80)('fill');

/***/ },
/* 53 */
/*!*********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.find.js ***!
  \*********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	  find: __webpack_require__(/*! ./$.array-methods */ 86)(5)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('find');

/***/ },
/* 54 */
/*!***************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.array.find-index.js ***!
  \***************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
	  findIndex: __webpack_require__(/*! ./$.array-methods */ 86)(6)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('findIndex');

/***/ },
/* 55 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.regexp.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $      = __webpack_require__(/*! ./$ */ 25)
	  , cof    = __webpack_require__(/*! ./$.cof */ 79)
	  , RegExp = $.g.RegExp
	  , Base   = RegExp
	  , proto  = RegExp.prototype;
	if($.FW && $.DESC){
	  // RegExp allows a regex with flags as the pattern
	  if(!function(){try{ return RegExp(/a/g, 'i') == '/a/i'; }catch(e){ /* empty */ }}()){
	    RegExp = function RegExp(pattern, flags){
	      return new Base(cof(pattern) == 'RegExp' && flags !== undefined
	        ? pattern.source : pattern, flags);
	    };
	    $.each.call($.getNames(Base), function(key){
	      key in RegExp || $.setDesc(RegExp, key, {
	        configurable: true,
	        get: function(){ return Base[key]; },
	        set: function(it){ Base[key] = it; }
	      });
	    });
	    proto.constructor = RegExp;
	    RegExp.prototype = proto;
	    $.hide($.g, 'RegExp', RegExp);
	  }
	  // 21.2.5.3 get RegExp.prototype.flags()
	  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
	    configurable: true,
	    get: __webpack_require__(/*! ./$.replacer */ 81)(/^.*\/(\w*)$/, '$1')
	  });
	}
	__webpack_require__(/*! ./$.species */ 90)(RegExp);

/***/ },
/* 56 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.promise.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , ctx     = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof     = __webpack_require__(/*! ./$.cof */ 79)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , assert  = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter   = __webpack_require__(/*! ./$.iter */ 71)
	  , SPECIES = __webpack_require__(/*! ./$.wks */ 85)('species')
	  , RECORD  = __webpack_require__(/*! ./$.uid */ 77).safe('record')
	  , forOf   = $iter.forOf
	  , PROMISE = 'Promise'
	  , global  = $.g
	  , process = global.process
	  , asap    = process && process.nextTick || __webpack_require__(/*! ./$.task */ 91).set
	  , Promise = global[PROMISE]
	  , Base    = Promise
	  , isFunction     = $.isFunction
	  , isObject       = $.isObject
	  , assertFunction = assert.fn
	  , assertObject   = assert.obj
	  , test;
	function getConstructor(C){
	  var S = assertObject(C)[SPECIES];
	  return S != undefined ? S : C;
	}
	isFunction(Promise) && isFunction(Promise.resolve)
	&& Promise.resolve(test = new Promise(function(){})) == test
	|| function(){
	  function isThenable(it){
	    var then;
	    if(isObject(it))then = it.then;
	    return isFunction(then) ? then : false;
	  }
	  function handledRejectionOrHasOnRejected(promise){
	    var record = promise[RECORD]
	      , chain  = record.c
	      , i      = 0
	      , react;
	    if(record.h)return true;
	    while(chain.length > i){
	      react = chain[i++];
	      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
	    }
	  }
	  function notify(record, isReject){
	    var chain = record.c;
	    if(isReject || chain.length)asap(function(){
	      var promise = record.p
	        , value   = record.v
	        , ok      = record.s == 1
	        , i       = 0;
	      if(isReject && !handledRejectionOrHasOnRejected(promise)){
	        setTimeout(function(){
	          if(!handledRejectionOrHasOnRejected(promise)){
	            if(cof(process) == 'process'){
	              process.emit('unhandledRejection', value, promise);
	            } else if(global.console && isFunction(console.error)){
	              console.error('Unhandled promise rejection', value);
	            }
	          }
	        }, 1e3);
	      } else while(chain.length > i)!function(react){
	        var cb = ok ? react.ok : react.fail
	          , ret, then;
	        try {
	          if(cb){
	            if(!ok)record.h = true;
	            ret = cb === true ? value : cb(value);
	            if(ret === react.P){
	              react.rej(TypeError(PROMISE + '-chain cycle'));
	            } else if(then = isThenable(ret)){
	              then.call(ret, react.res, react.rej);
	            } else react.res(ret);
	          } else react.rej(value);
	        } catch(err){
	          react.rej(err);
	        }
	      }(chain[i++]);
	      chain.length = 0;
	    });
	  }
	  function reject(value){
	    var record = this;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    record.v = value;
	    record.s = 2;
	    notify(record, true);
	  }
	  function resolve(value){
	    var record = this
	      , then, wrapper;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    try {
	      if(then = isThenable(value)){
	        wrapper = {r: record, d: false}; // wrap
	        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
	      } else {
	        record.v = value;
	        record.s = 1;
	        notify(record);
	      }
	    } catch(err){
	      reject.call(wrapper || {r: record, d: false}, err); // wrap
	    }
	  }
	  // 25.4.3.1 Promise(executor)
	  Promise = function(executor){
	    assertFunction(executor);
	    var record = {
	      p: assert.inst(this, Promise, PROMISE), // <- promise
	      c: [],                                  // <- chain
	      s: 0,                                   // <- state
	      d: false,                               // <- done
	      v: undefined,                           // <- value
	      h: false                                // <- handled rejection
	    };
	    $.hide(this, RECORD, record);
	    try {
	      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
	    } catch(err){
	      reject.call(record, err);
	    }
	  };
	  $.mix(Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function(onFulfilled, onRejected){
	      var S = assertObject(assertObject(this).constructor)[SPECIES];
	      var react = {
	        ok:   isFunction(onFulfilled) ? onFulfilled : true,
	        fail: isFunction(onRejected)  ? onRejected  : false
	      };
	      var P = react.P = new (S != undefined ? S : Promise)(function(res, rej){
	        react.res = assertFunction(res);
	        react.rej = assertFunction(rej);
	      });
	      var record = this[RECORD];
	      record.c.push(react);
	      record.s && notify(record);
	      return P;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	}();
	$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
	$def($def.S, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function(r){
	    return new (getConstructor(this))(function(res, rej){
	      rej(r);
	    });
	  },
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function(x){
	    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
	      ? x : new (getConstructor(this))(function(res){
	        res(x);
	      });
	  }
	});
	$def($def.S + $def.F * ($iter.fail(function(iter){
	  Promise.all(iter)['catch'](function(){});
	}) || $iter.DANGER_CLOSING), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function(iterable){
	    var C      = getConstructor(this)
	      , values = [];
	    return new C(function(resolve, reject){
	      forOf(iterable, false, values.push, values);
	      var remaining = values.length
	        , results   = Array(remaining);
	      if(remaining)$.each.call(values, function(promise, index){
	        C.resolve(promise).then(function(value){
	          results[index] = value;
	          --remaining || resolve(results);
	        }, reject);
	      });
	      else resolve(results);
	    });
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function(iterable){
	    var C = getConstructor(this);
	    return new C(function(resolve, reject){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(resolve, reject);
	      });
	    });
	  }
	});
	cof.set(Promise, PROMISE);
	__webpack_require__(/*! ./$.species */ 90)(Promise);

/***/ },
/* 57 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.map.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 92);
	
	// 23.1 Map Objects
	__webpack_require__(/*! ./$.collection */ 93)('Map', {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 58 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.set.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 92);
	
	// 23.2 Set Objects
	__webpack_require__(/*! ./$.collection */ 93)('Set', {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 59 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.weak-map.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , weak      = __webpack_require__(/*! ./$.collection-weak */ 94)
	  , leakStore = weak.leakStore
	  , ID        = weak.ID
	  , WEAK      = weak.WEAK
	  , has       = $.has
	  , isObject  = $.isObject
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , tmp       = {};
	
	// 23.3 WeakMap Objects
	var WeakMap = __webpack_require__(/*! ./$.collection */ 93)('WeakMap', {
	  // 23.3.3.3 WeakMap.prototype.get(key)
	  get: function(key){
	    if(isObject(key)){
	      if(isFrozen(key))return leakStore(this).get(key);
	      if(has(key, WEAK))return key[WEAK][this[ID]];
	    }
	  },
	  // 23.3.3.5 WeakMap.prototype.set(key, value)
	  set: function(key, value){
	    return weak.def(this, key, value);
	  }
	}, weak, true, true);
	
	// IE11 WeakMap frozen keys fix
	if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
	  $.each.call(['delete', 'has', 'get', 'set'], function(key){
	    var method = WeakMap.prototype[key];
	    WeakMap.prototype[key] = function(a, b){
	      // store frozen objects on leaky map
	      if(isObject(a) && isFrozen(a)){
	        var result = leakStore(this)[key](a, b);
	        return key == 'set' ? this : result;
	      // store all the rest on native weakmap
	      } return method.call(this, a, b);
	    };
	  });
	}

/***/ },
/* 60 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.weak-set.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var weak = __webpack_require__(/*! ./$.collection-weak */ 94);
	
	// 23.4 WeakSet Objects
	__webpack_require__(/*! ./$.collection */ 93)('WeakSet', {
	  // 23.4.3.1 WeakSet.prototype.add(value)
	  add: function(value){
	    return weak.def(this, value, true);
	  }
	}, weak, false, true);

/***/ },
/* 61 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es6.reflect.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(/*! ./$ */ 25)
	  , $def      = __webpack_require__(/*! ./$.def */ 72)
	  , setProto  = __webpack_require__(/*! ./$.set-proto */ 88)
	  , $iter     = __webpack_require__(/*! ./$.iter */ 71)
	  , ITER      = __webpack_require__(/*! ./$.uid */ 77).safe('iter')
	  , step      = $iter.step
	  , assert    = __webpack_require__(/*! ./$.assert */ 76)
	  , isObject  = $.isObject
	  , getDesc   = $.getDesc
	  , setDesc   = $.setDesc
	  , getProto  = $.getProto
	  , apply     = Function.apply
	  , assertObject = assert.obj
	  , isExtensible = Object.isExtensible || $.it;
	function Enumerate(iterated){
	  var keys = [], key;
	  for(key in iterated)keys.push(key);
	  $.set(this, ITER, {o: iterated, a: keys, i: 0});
	}
	$iter.create(Enumerate, 'Object', function(){
	  var iter = this[ITER]
	    , keys = iter.a
	    , key;
	  do {
	    if(iter.i >= keys.length)return step(1);
	  } while(!((key = keys[iter.i++]) in iter.o));
	  return step(0, key);
	});
	
	function wrap(fn){
	  return function(it){
	    assertObject(it);
	    try {
	      fn.apply(undefined, arguments);
	      return true;
	    } catch(e){
	      return false;
	    }
	  };
	}
	
	function reflectGet(target, propertyKey/*, receiver*/){
	  var receiver = arguments.length < 3 ? target : arguments[2]
	    , desc = getDesc(assertObject(target), propertyKey), proto;
	  if(desc)return $.has(desc, 'value')
	    ? desc.value
	    : desc.get === undefined
	      ? undefined
	      : desc.get.call(receiver);
	  return isObject(proto = getProto(target))
	    ? reflectGet(proto, propertyKey, receiver)
	    : undefined;
	}
	function reflectSet(target, propertyKey, V/*, receiver*/){
	  var receiver = arguments.length < 4 ? target : arguments[3]
	    , ownDesc  = getDesc(assertObject(target), propertyKey)
	    , existingDescriptor, proto;
	  if(!ownDesc){
	    if(isObject(proto = getProto(target))){
	      return reflectSet(proto, propertyKey, V, receiver);
	    }
	    ownDesc = $.desc(0);
	  }
	  if($.has(ownDesc, 'value')){
	    if(ownDesc.writable === false || !isObject(receiver))return false;
	    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
	    existingDescriptor.value = V;
	    setDesc(receiver, propertyKey, existingDescriptor);
	    return true;
	  }
	  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
	}
	
	var reflect = {
	  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
	  apply: __webpack_require__(/*! ./$.ctx */ 74)(Function.call, apply, 3),
	  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
	  construct: function(target, argumentsList /*, newTarget*/){
	    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
	      , instance = $.create(isObject(proto) ? proto : Object.prototype)
	      , result   = apply.call(target, instance, argumentsList);
	    return isObject(result) ? result : instance;
	  },
	  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
	  defineProperty: wrap(setDesc),
	  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
	  deleteProperty: function(target, propertyKey){
	    var desc = getDesc(assertObject(target), propertyKey);
	    return desc && !desc.configurable ? false : delete target[propertyKey];
	  },
	  // 26.1.5 Reflect.enumerate(target)
	  enumerate: function(target){
	    return new Enumerate(assertObject(target));
	  },
	  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
	  get: reflectGet,
	  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
	  getOwnPropertyDescriptor: function(target, propertyKey){
	    return getDesc(assertObject(target), propertyKey);
	  },
	  // 26.1.8 Reflect.getPrototypeOf(target)
	  getPrototypeOf: function(target){
	    return getProto(assertObject(target));
	  },
	  // 26.1.9 Reflect.has(target, propertyKey)
	  has: function(target, propertyKey){
	    return propertyKey in target;
	  },
	  // 26.1.10 Reflect.isExtensible(target)
	  isExtensible: function(target){
	    return !!isExtensible(assertObject(target));
	  },
	  // 26.1.11 Reflect.ownKeys(target)
	  ownKeys: __webpack_require__(/*! ./$.own-keys */ 78),
	  // 26.1.12 Reflect.preventExtensions(target)
	  preventExtensions: wrap(Object.preventExtensions || $.it),
	  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
	  set: reflectSet
	};
	// 26.1.14 Reflect.setPrototypeOf(target, proto)
	if(setProto)reflect.setPrototypeOf = function(target, proto){
	  setProto(assertObject(target), proto);
	  return true;
	};
	
	$def($def.G, {Reflect: {}});
	$def($def.S, 'Reflect', reflect);

/***/ },
/* 62 */
/*!*************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.array.includes.js ***!
  \*************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/domenic/Array.prototype.includes
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'Array', {
	  includes: __webpack_require__(/*! ./$.array-includes */ 87)(true)
	});
	__webpack_require__(/*! ./$.unscope */ 80)('includes');

/***/ },
/* 63 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.string.at.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/mathiasbynens/String.prototype.at
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.P, 'String', {
	  at: __webpack_require__(/*! ./$.string-at */ 89)(true)
	});

/***/ },
/* 64 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.regexp.escape.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/kangax/9698100
	var $def = __webpack_require__(/*! ./$.def */ 72);
	$def($def.S, 'RegExp', {
	  escape: __webpack_require__(/*! ./$.replacer */ 81)(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
	});

/***/ },
/* 65 */
/*!**********************************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.object.get-own-property-descriptors.js ***!
  \**********************************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/WebReflection/9353781
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , ownKeys = __webpack_require__(/*! ./$.own-keys */ 78);
	
	$def($def.S, 'Object', {
	  getOwnPropertyDescriptors: function(object){
	    var O      = $.toObject(object)
	      , result = {};
	    $.each.call(ownKeys(O), function(key){
	      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
	    });
	    return result;
	  }
	});

/***/ },
/* 66 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/es7.object.to-array.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// http://goo.gl/XkBrjD
	var $    = __webpack_require__(/*! ./$ */ 25)
	  , $def = __webpack_require__(/*! ./$.def */ 72);
	function createObjectToArray(isEntries){
	  return function(object){
	    var O      = $.toObject(object)
	      , keys   = $.getKeys(object)
	      , length = keys.length
	      , i      = 0
	      , result = Array(length)
	      , key;
	    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
	    else while(length > i)result[i] = O[keys[i++]];
	    return result;
	  };
	}
	$def($def.S, 'Object', {
	  values:  createObjectToArray(false),
	  entries: createObjectToArray(true)
	});

/***/ },
/* 67 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/js.array.statics.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// JavaScript 1.6 / Strawman array statics shim
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , core    = $.core
	  , statics = {};
	function setStatics(keys, length){
	  $.each.call(keys.split(','), function(key){
	    if(length == undefined && key in core.Array)statics[key] = core.Array[key];
	    else if(key in [])statics[key] = __webpack_require__(/*! ./$.ctx */ 74)(Function.call, [][key], length);
	  });
	}
	setStatics('pop,reverse,shift,keys,values,entries', 1);
	setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
	setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
	           'reduce,reduceRight,copyWithin,fill,turn');
	$def($def.S, 'Array', statics);

/***/ },
/* 68 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.timers.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// ie9- setTimeout & setInterval additional parameters fix
	var $       = __webpack_require__(/*! ./$ */ 25)
	  , $def    = __webpack_require__(/*! ./$.def */ 72)
	  , invoke  = __webpack_require__(/*! ./$.invoke */ 75)
	  , partial = __webpack_require__(/*! ./$.partial */ 73)
	  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
	function wrap(set){
	  return MSIE ? function(fn, time /*, ...args */){
	    return set(invoke(
	      partial,
	      [].slice.call(arguments, 2),
	      $.isFunction(fn) ? fn : Function(fn)
	    ), time);
	  } : set;
	}
	$def($def.G + $def.B + $def.F * MSIE, {
	  setTimeout:  wrap($.g.setTimeout),
	  setInterval: wrap($.g.setInterval)
	});

/***/ },
/* 69 */
/*!********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.immediate.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $task = __webpack_require__(/*! ./$.task */ 91);
	$def($def.G + $def.B, {
	  setImmediate:   $task.set,
	  clearImmediate: $task.clear
	});

/***/ },
/* 70 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/web.dom.iterable.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./es6.array.iterator */ 49);
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , Iterators = __webpack_require__(/*! ./$.iter */ 71).Iterators
	  , ITERATOR  = __webpack_require__(/*! ./$.wks */ 85)('iterator')
	  , NodeList  = $.g.NodeList;
	if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
	  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
	}
	Iterators.NodeList = Iterators.Array;

/***/ },
/* 71 */
/*!*************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.iter.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $                 = __webpack_require__(/*! ./$ */ 25)
	  , ctx               = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof               = __webpack_require__(/*! ./$.cof */ 79)
	  , $def              = __webpack_require__(/*! ./$.def */ 72)
	  , assertObject      = __webpack_require__(/*! ./$.assert */ 76).obj
	  , SYMBOL_ITERATOR   = __webpack_require__(/*! ./$.wks */ 85)('iterator')
	  , FF_ITERATOR       = '@@iterator'
	  , Iterators         = {}
	  , IteratorPrototype = {};
	// Safari has byggy iterators w/o `next`
	var BUGGY = 'keys' in [] && !('next' in [].keys());
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	setIterator(IteratorPrototype, $.that);
	function setIterator(O, value){
	  $.hide(O, SYMBOL_ITERATOR, value);
	  // Add iterator for FF iterator protocol
	  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
	}
	function defineIterator(Constructor, NAME, value, DEFAULT){
	  var proto = Constructor.prototype
	    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
	  // Define iterator
	  if($.FW)setIterator(proto, iter);
	  if(iter !== value){
	    var iterProto = $.getProto(iter.call(new Constructor));
	    // Set @@toStringTag to native iterators
	    cof.set(iterProto, NAME + ' Iterator', true);
	    // FF fix
	    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
	  }
	  // Plug for library
	  Iterators[NAME] = iter;
	  // FF & v8 fix
	  Iterators[NAME + ' Iterator'] = $.that;
	  return iter;
	}
	function getIterator(it){
	  var Symbol  = $.g.Symbol
	    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
	    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
	  return assertObject(getIter.call(it));
	}
	function closeIterator(iterator){
	  var ret = iterator['return'];
	  if(ret !== undefined)assertObject(ret.call(iterator));
	}
	function stepCall(iterator, fn, value, entries){
	  try {
	    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
	  } catch(e){
	    closeIterator(iterator);
	    throw e;
	  }
	}
	var DANGER_CLOSING = true;
	!function(){
	  try {
	    var iter = [1].keys();
	    iter['return'] = function(){ DANGER_CLOSING = false; };
	    Array.from(iter, function(){ throw 2; });
	  } catch(e){ /* empty */ }
	}();
	var $iter = module.exports = {
	  BUGGY: BUGGY,
	  DANGER_CLOSING: DANGER_CLOSING,
	  fail: function(exec){
	    var fail = true;
	    try {
	      var arr  = [[{}, 1]]
	        , iter = arr[SYMBOL_ITERATOR]()
	        , next = iter.next;
	      iter.next = function(){
	        fail = false;
	        return next.call(this);
	      };
	      arr[SYMBOL_ITERATOR] = function(){
	        return iter;
	      };
	      exec(arr);
	    } catch(e){ /* empty */ }
	    return fail;
	  },
	  Iterators: Iterators,
	  prototype: IteratorPrototype,
	  step: function(done, value){
	    return {value: value, done: !!done};
	  },
	  stepCall: stepCall,
	  close: closeIterator,
	  is: function(it){
	    var O      = Object(it)
	      , Symbol = $.g.Symbol
	      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
	    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
	  },
	  get: getIterator,
	  set: setIterator,
	  create: function(Constructor, NAME, next, proto){
	    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
	    cof.set(Constructor, NAME + ' Iterator');
	  },
	  define: defineIterator,
	  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	    function createIter(kind){
	      return function(){
	        return new Constructor(this, kind);
	      };
	    }
	    $iter.create(Constructor, NAME, next);
	    var entries = createIter('key+value')
	      , values  = createIter('value')
	      , proto   = Base.prototype
	      , methods, key;
	    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
	    else entries = defineIterator(Base, NAME, entries, 'entries');
	    if(DEFAULT){
	      methods = {
	        entries: entries,
	        keys:    IS_SET ? values : createIter('key'),
	        values:  values
	      };
	      $def($def.P + $def.F * BUGGY, NAME, methods);
	      if(FORCE)for(key in methods){
	        if(!(key in proto))$.hide(proto, key, methods[key]);
	      }
	    }
	  },
	  forOf: function(iterable, entries, fn, that){
	    var iterator = getIterator(iterable)
	      , f = ctx(fn, that, entries ? 2 : 1)
	      , step;
	    while(!(step = iterator.next()).done){
	      if(stepCall(iterator, f, step.value, entries) === false){
	        return closeIterator(iterator);
	      }
	    }
	  }
	};

/***/ },
/* 72 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.def.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 25)
	  , global     = $.g
	  , core       = $.core
	  , isFunction = $.isFunction;
	function ctx(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	}
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	function $def(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {}).prototype
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && !isFunction(target[key]))exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp.prototype = C.prototype;
	    }(out);
	    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
	    // export
	    $.hide(exports, key, exp);
	  }
	}
	module.exports = $def;

/***/ },
/* 73 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.partial.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	module.exports = function(/* ...pargs */){
	  var fn     = assertFunction(this)
	    , length = arguments.length
	    , pargs  = Array(length)
	    , i      = 0
	    , _      = $.path._
	    , holder = false;
	  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
	  return function(/* ...args */){
	    var that    = this
	      , _length = arguments.length
	      , j = 0, k = 0, args;
	    if(!holder && !_length)return invoke(fn, pargs, that);
	    args = pargs.slice();
	    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
	    while(_length > k)args.push(arguments[k++]);
	    return invoke(fn, args, that);
	  };
	};

/***/ },
/* 74 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.ctx.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Optional / simple context binding
	var assertFunction = __webpack_require__(/*! ./$.assert */ 76).fn;
	module.exports = function(fn, that, length){
	  assertFunction(fn);
	  if(~length && that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	    };
	};

/***/ },
/* 75 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.invoke.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Fast apply
	// http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
	                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 76 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.assert.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	function assert(condition, msg1, msg2){
	  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
	}
	assert.def = $.assertDefined;
	assert.fn = function(it){
	  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
	  return it;
	};
	assert.obj = function(it){
	  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};
	assert.inst = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};
	module.exports = assert;

/***/ },
/* 77 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.uid.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var sid = 0;
	function uid(key){
	  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
	}
	uid.safe = __webpack_require__(/*! ./$ */ 25).g.Symbol || uid;
	module.exports = uid;

/***/ },
/* 78 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.own-keys.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $            = __webpack_require__(/*! ./$ */ 25)
	  , assertObject = __webpack_require__(/*! ./$.assert */ 76).obj;
	module.exports = function(it){
	  assertObject(it);
	  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
	};

/***/ },
/* 79 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.cof.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 25)
	  , TAG      = __webpack_require__(/*! ./$.wks */ 85)('toStringTag')
	  , toString = {}.toString;
	function cof(it){
	  return toString.call(it).slice(8, -1);
	}
	cof.classof = function(it){
	  var O, T;
	  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
	};
	cof.set = function(it, tag, stat){
	  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
	};
	module.exports = cof;

/***/ },
/* 80 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.unscope.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var $           = __webpack_require__(/*! ./$ */ 25)
	  , UNSCOPABLES = __webpack_require__(/*! ./$.wks */ 85)('unscopables');
	if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
	module.exports = function(key){
	  if($.FW)[][UNSCOPABLES][key] = true;
	};

/***/ },
/* 81 */
/*!*****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.replacer.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function(regExp, replace, isStatic){
	  var replacer = replace === Object(replace) ? function(part){
	    return replace[part];
	  } : replace;
	  return function(it){
	    return String(isStatic ? it : this).replace(regExp, replacer);
	  };
	};

/***/ },
/* 82 */
/*!***************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.assign.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	// 19.1.2.1 Object.assign(target, source, ...)
	module.exports = Object.assign || function(target, source){ // eslint-disable-line no-unused-vars
	  var T = Object($.assertDefined(target))
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = $.ES5Object(arguments[i++])
	      , keys   = $.getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	};

/***/ },
/* 83 */
/*!**************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.keyof.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(object, el){
	  var O      = $.toObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 84 */
/*!***********************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.fw.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = function($){
	  $.FW   = false;
	  $.path = $.core;
	  return $;
	};

/***/ },
/* 85 */
/*!************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.wks.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(/*! ./$ */ 25).g
	  , store  = {};
	module.exports = function(name){
	  return store[name] || (store[name] =
	    global.Symbol && global.Symbol[name] || __webpack_require__(/*! ./$.uid */ 77).safe('Symbol.' + name));
	};

/***/ },
/* 86 */
/*!**********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.array-methods.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var $   = __webpack_require__(/*! ./$ */ 25)
	  , ctx = __webpack_require__(/*! ./$.ctx */ 74);
	module.exports = function(TYPE){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
	  return function(callbackfn/*, that = undefined */){
	    var O      = Object($.assertDefined(this))
	      , self   = $.ES5Object(O)
	      , f      = ctx(callbackfn, arguments[1], 3)
	      , length = $.toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 87 */
/*!***********************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.array-includes.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// false -> Array#indexOf
	// true  -> Array#includes
	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(IS_INCLUDES){
	  return function(el /*, fromIndex = 0 */){
	    var O      = $.toObject(this)
	      , length = $.toLength(O.length)
	      , index  = $.toIndex(arguments[1], length)
	      , value;
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 88 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.set-proto.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't works with null proto objects.
	/*eslint-disable no-proto */
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , assert = __webpack_require__(/*! ./$.assert */ 76);
	module.exports = Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	  ? function(buggy, set){
	      try {
	        set = __webpack_require__(/*! ./$.ctx */ 74)(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
	        set({}, []);
	      } catch(e){ buggy = true; }
	      return function(O, proto){
	        assert.obj(O);
	        assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }()
	  : undefined);

/***/ },
/* 89 */
/*!******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.string-at.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// true  -> String#at
	// false -> String#codePointAt
	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(TO_STRING){
	  return function(pos){
	    var s = String($.assertDefined(this))
	      , i = $.toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 90 */
/*!****************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.species.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 25);
	module.exports = function(C){
	  if($.DESC && $.FW)$.setDesc(C, __webpack_require__(/*! ./$.wks */ 85)('species'), {
	    configurable: true,
	    get: $.that
	  });
	};

/***/ },
/* 91 */
/*!*************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.task.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 25)
	  , ctx    = __webpack_require__(/*! ./$.ctx */ 74)
	  , cof    = __webpack_require__(/*! ./$.cof */ 79)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 75)
	  , global             = $.g
	  , isFunction         = $.isFunction
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , postMessage        = global.postMessage
	  , addEventListener   = global.addEventListener
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	function run(){
	  var id = +this;
	  if($.has(queue, id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	}
	function listner(event){
	  run.call(event.data);
	}
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!isFunction(setTask) || !isFunction(clearTask)){
	  setTask = function(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(isFunction(fn) ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(cof(global.process) == 'process'){
	    defer = function(id){
	      global.process.nextTick(ctx(run, id, 1));
	    };
	  // Modern browsers, skip implementation for WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is object
	  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
	    defer = function(id){
	      postMessage(id, '*');
	    };
	    addEventListener('message', listner, false);
	  // WebWorkers
	  } else if(isFunction(MessageChannel)){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // IE8-
	  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
	    defer = function(id){
	      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
	        $.html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 92 */
/*!**************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection-strong.js ***!
  \**************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $        = __webpack_require__(/*! ./$ */ 25)
	  , ctx      = __webpack_require__(/*! ./$.ctx */ 74)
	  , safe     = __webpack_require__(/*! ./$.uid */ 77).safe
	  , assert   = __webpack_require__(/*! ./$.assert */ 76)
	  , $iter    = __webpack_require__(/*! ./$.iter */ 71)
	  , has      = $.has
	  , set      = $.set
	  , isObject = $.isObject
	  , hide     = $.hide
	  , step     = $iter.step
	  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
	  , ID       = safe('id')
	  , O1       = safe('O1')
	  , LAST     = safe('last')
	  , FIRST    = safe('first')
	  , ITER     = safe('iter')
	  , SIZE     = $.DESC ? safe('size') : 'size'
	  , id       = 0;
	
	function fastKey(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
	  // can't set id to frozen object
	  if(isFrozen(it))return 'F';
	  if(!has(it, ID)){
	    // not necessary to add id
	    if(!create)return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	  // return object id with prefix
	  } return 'O' + it[ID];
	}
	
	function getEntry(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index != 'F')return that[O1][index];
	  // frozen object case
	  for(entry = that[FIRST]; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      var that = assert.inst(this, C, NAME);
	      set(that, O1, $.create(null));
	      set(that, SIZE, 0);
	      set(that, LAST, undefined);
	      set(that, FIRST, undefined);
	      if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	    }
	    $.mix(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function(){
	        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that[FIRST] = that[LAST] = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that[O1][entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that[FIRST] == entry)that[FIRST] = next;
	          if(that[LAST] == entry)that[LAST] = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function(callbackfn /*, that = undefined */){
	        var f = ctx(callbackfn, arguments[1], 3)
	          , entry;
	        while(entry = entry ? entry.n : this[FIRST]){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if($.DESC)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return assert.def(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that[LAST] = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that[LAST],          // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that[FIRST])that[FIRST] = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index != 'F')that[O1][index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  getIterConstructor: function(){
	    return function(iterated, kind){
	      set(this, ITER, {o: iterated, k: kind});
	    };
	  },
	  next: function(){
	    var iter  = this[ITER]
	      , kind  = iter.k
	      , entry = iter.l;
	    // revert to the last existing entry
	    while(entry && entry.r)entry = entry.p;
	    // get next entry
	    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
	      // or finish the iteration
	      iter.o = undefined;
	      return step(1);
	    }
	    // return step by kind
	    if(kind == 'key'  )return step(0, entry.k);
	    if(kind == 'value')return step(0, entry.v);
	    return step(0, [entry.k, entry.v]);
	  }
	};

/***/ },
/* 93 */
/*!*******************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection.js ***!
  \*******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $     = __webpack_require__(/*! ./$ */ 25)
	  , $def  = __webpack_require__(/*! ./$.def */ 72)
	  , $iter = __webpack_require__(/*! ./$.iter */ 71)
	  , assertInstance = __webpack_require__(/*! ./$.assert */ 76).inst;
	
	module.exports = function(NAME, methods, common, IS_MAP, isWeak){
	  var Base  = $.g[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  function fixMethod(KEY, CHAIN){
	    var method = proto[KEY];
	    if($.FW)proto[KEY] = function(a, b){
	      var result = method.call(this, a === 0 ? 0 : a, b);
	      return CHAIN ? this : result;
	    };
	  }
	  if(!$.isFunction(C) || !(isWeak || !$iter.BUGGY && proto.forEach && proto.entries)){
	    // create collection constructor
	    C = common.getConstructor(NAME, IS_MAP, ADDER);
	    $.mix(C.prototype, methods);
	  } else {
	    var inst  = new C
	      , chain = inst[ADDER](isWeak ? {} : -0, 1)
	      , buggyZero;
	    // wrap for init collections from iterable
	    if($iter.fail(function(iter){
	      new C(iter); // eslint-disable-line no-new
	    }) || $iter.DANGER_CLOSING){
	      C = function(iterable){
	        assertInstance(this, C, NAME);
	        var that = new Base;
	        if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      };
	      C.prototype = proto;
	      if($.FW)proto.constructor = C;
	    }
	    isWeak || inst.forEach(function(val, key){
	      buggyZero = 1 / key === -Infinity;
	    });
	    // fix converting -0 key to +0
	    if(buggyZero){
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    // + fix .add & .set for chaining
	    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
	  }
	
	  __webpack_require__(/*! ./$.cof */ 79).set(C, NAME);
	  __webpack_require__(/*! ./$.species */ 90)(C);
	
	  O[NAME] = C;
	  $def($def.G + $def.W + $def.F * (C != Base), O);
	
	  // add .keys, .values, .entries, [@@iterator]
	  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	  if(!isWeak)$iter.std(
	    C, NAME,
	    common.getIterConstructor(), common.next,
	    IS_MAP ? 'key+value' : 'value' , !IS_MAP, true
	  );
	
	  return C;
	};

/***/ },
/* 94 */
/*!************************************************************************!*\
  !*** ./~/babel-runtime/~/core-js/library/modules/$.collection-weak.js ***!
  \************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 25)
	  , safe      = __webpack_require__(/*! ./$.uid */ 77).safe
	  , assert    = __webpack_require__(/*! ./$.assert */ 76)
	  , forOf     = __webpack_require__(/*! ./$.iter */ 71).forOf
	  , has       = $.has
	  , isObject  = $.isObject
	  , hide      = $.hide
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , id        = 0
	  , ID        = safe('id')
	  , WEAK      = safe('weak')
	  , LEAK      = safe('leak')
	  , method    = __webpack_require__(/*! ./$.array-methods */ 86)
	  , find      = method(5)
	  , findIndex = method(6);
	function findFrozen(store, key){
	  return find.call(store.array, function(it){
	    return it[0] === key;
	  });
	}
	// fallback for frozen keys
	function leakStore(that){
	  return that[LEAK] || hide(that, LEAK, {
	    array: [],
	    get: function(key){
	      var entry = findFrozen(this, key);
	      if(entry)return entry[1];
	    },
	    has: function(key){
	      return !!findFrozen(this, key);
	    },
	    set: function(key, value){
	      var entry = findFrozen(this, key);
	      if(entry)entry[1] = value;
	      else this.array.push([key, value]);
	    },
	    'delete': function(key){
	      var index = findIndex.call(this.array, function(it){
	        return it[0] === key;
	      });
	      if(~index)this.array.splice(index, 1);
	      return !!~index;
	    }
	  })[LEAK];
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      $.set(assert.inst(this, C, NAME), ID, id++);
	      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
	    }
	    $.mix(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this)['delete'](key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this).has(key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    if(isFrozen(assert.obj(key))){
	      leakStore(that).set(key, value);
	    } else {
	      has(key, WEAK) || hide(key, WEAK, {});
	      key[WEAK][that[ID]] = value;
	    } return that;
	  },
	  leakStore: leakStore,
	  WEAK: WEAK,
	  ID: ID
	};

/***/ },
/* 95 */
/*!*****************************************************!*\
  !*** ./~/babel-core/~/regenerator-babel/runtime.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
	 * additional grant of patent rights can be found in the PATENTS file in
	 * the same directory.
	 */
	
	!(function(global) {
	  "use strict";
	
	  var hasOwn = Object.prototype.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var iteratorSymbol =
	    typeof Symbol === "function" && Symbol.iterator || "@@iterator";
	
	  var inModule = typeof module === "object";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    if (inModule) {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }
	
	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = inModule ? module.exports : {};
	
	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
	  }
	  runtime.wrap = wrap;
	
	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }
	
	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";
	
	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};
	
	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}
	
	  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunction.displayName = "GeneratorFunction";
	
	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };
	
	  runtime.mark = function(genFun) {
	    genFun.__proto__ = GeneratorFunctionPrototype;
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };
	
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    return new Promise(function(resolve, reject) {
	      var generator = wrap(innerFn, outerFn, self, tryLocsList);
	      var callNext = step.bind(generator.next);
	      var callThrow = step.bind(generator["throw"]);
	
	      function step(arg) {
	        var record = tryCatch(this, null, arg);
	        if (record.type === "throw") {
	          reject(record.arg);
	          return;
	        }
	
	        var info = record.arg;
	        if (info.done) {
	          resolve(info.value);
	        } else {
	          Promise.resolve(info.value).then(callNext, callThrow);
	        }
	      }
	
	      callNext();
	    });
	  };
	
	  function Generator(innerFn, outerFn, self, tryLocsList) {
	    var generator = outerFn ? Object.create(outerFn.prototype) : this;
	    var context = new Context(tryLocsList);
	    var state = GenStateSuspendedStart;
	
	    function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }
	
	      if (state === GenStateCompleted) {
	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }
	
	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var record = tryCatch(
	            delegate.iterator[method],
	            delegate.iterator,
	            arg
	          );
	
	          if (record.type === "throw") {
	            context.delegate = null;
	
	            // Like returning generator.throw(uncaught), but without the
	            // overhead of an extra function call.
	            method = "throw";
	            arg = record.arg;
	
	            continue;
	          }
	
	          // Delegate generator ran and handled its own exceptions so
	          // regardless of what the method was, we continue as if it is
	          // "next" with an undefined arg.
	          method = "next";
	          arg = undefined;
	
	          var info = record.arg;
	          if (info.done) {
	            context[delegate.resultName] = info.value;
	            context.next = delegate.nextLoc;
	          } else {
	            state = GenStateSuspendedYield;
	            return info;
	          }
	
	          context.delegate = null;
	        }
	
	        if (method === "next") {
	          if (state === GenStateSuspendedStart &&
	              typeof arg !== "undefined") {
	            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	            throw new TypeError(
	              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
	            );
	          }
	
	          if (state === GenStateSuspendedYield) {
	            context.sent = arg;
	          } else {
	            delete context.sent;
	          }
	
	        } else if (method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw arg;
	          }
	
	          if (context.dispatchException(arg)) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            method = "next";
	            arg = undefined;
	          }
	
	        } else if (method === "return") {
	          context.abrupt("return", arg);
	        }
	
	        state = GenStateExecuting;
	
	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;
	
	          var info = {
	            value: record.arg,
	            done: context.done
	          };
	
	          if (record.arg === ContinueSentinel) {
	            if (context.delegate && method === "next") {
	              // Deliberately forget the last sent value so that we don't
	              // accidentally pass it on to the delegate.
	              arg = undefined;
	            }
	          } else {
	            return info;
	          }
	
	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	
	          if (method === "next") {
	            context.dispatchException(record.arg);
	          } else {
	            arg = record.arg;
	          }
	        }
	      }
	    }
	
	    generator.next = invoke.bind(generator, "next");
	    generator["throw"] = invoke.bind(generator, "throw");
	    generator["return"] = invoke.bind(generator, "return");
	
	    return generator;
	  }
	
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };
	
	  Gp.toString = function() {
	    return "[object Generator]";
	  };
	
	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };
	
	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }
	
	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }
	
	    this.tryEntries.push(entry);
	  }
	
	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }
	
	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset();
	  }
	
	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();
	
	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }
	
	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };
	
	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }
	
	      if (typeof iterable.next === "function") {
	        return iterable;
	      }
	
	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }
	
	          next.value = undefined;
	          next.done = true;
	
	          return next;
	        };
	
	        return next.next = next;
	      }
	    }
	
	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;
	
	  function doneResult() {
	    return { value: undefined, done: true };
	  }
	
	  Context.prototype = {
	    constructor: Context,
	
	    reset: function() {
	      this.prev = 0;
	      this.next = 0;
	      this.sent = undefined;
	      this.done = false;
	      this.delegate = null;
	
	      this.tryEntries.forEach(resetTryEntry);
	
	      // Pre-initialize at least 20 temporary variables to enable hidden
	      // class optimizations for simple generators.
	      for (var tempIndex = 0, tempName;
	           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
	           ++tempIndex) {
	        this[tempName] = null;
	      }
	    },
	
	    stop: function() {
	      this.done = true;
	
	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }
	
	      return this.rval;
	    },
	
	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }
	
	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;
	        return !!caught;
	      }
	
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;
	
	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }
	
	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");
	
	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	
	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }
	
	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	
	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },
	
	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }
	
	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg < finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }
	
	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;
	
	      if (finallyEntry) {
	        this.next = finallyEntry.finallyLoc;
	      } else {
	        this.complete(record);
	      }
	
	      return ContinueSentinel;
	    },
	
	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }
	
	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = record.arg;
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }
	
	      return ContinueSentinel;
	    },
	
	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          return this.complete(entry.completion, entry.afterLoc);
	        }
	      }
	    },
	
	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }
	
	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },
	
	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };
	
	      return ContinueSentinel;
	    }
	  };
	})(
	  // Among the various tricks for obtaining a reference to the global
	  // object, this seems to be the most reliable technique that does not
	  // use indirect eval (which violates Content Security Policy).
	  typeof global === "object" ? global :
	  typeof window === "object" ? window : this
	);
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 96 */
/*!****************************************!*\
  !*** ./~/babel-core/~/core-js/shim.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./modules/es5 */ 140);
	__webpack_require__(/*! ./modules/es6.symbol */ 97);
	__webpack_require__(/*! ./modules/es6.object.assign */ 98);
	__webpack_require__(/*! ./modules/es6.object.is */ 99);
	__webpack_require__(/*! ./modules/es6.object.set-prototype-of */ 100);
	__webpack_require__(/*! ./modules/es6.object.to-string */ 101);
	__webpack_require__(/*! ./modules/es6.object.statics-accept-primitives */ 102);
	__webpack_require__(/*! ./modules/es6.function.name */ 103);
	__webpack_require__(/*! ./modules/es6.number.constructor */ 104);
	__webpack_require__(/*! ./modules/es6.number.statics */ 105);
	__webpack_require__(/*! ./modules/es6.math */ 106);
	__webpack_require__(/*! ./modules/es6.string.from-code-point */ 107);
	__webpack_require__(/*! ./modules/es6.string.raw */ 108);
	__webpack_require__(/*! ./modules/es6.string.iterator */ 109);
	__webpack_require__(/*! ./modules/es6.string.code-point-at */ 110);
	__webpack_require__(/*! ./modules/es6.string.ends-with */ 111);
	__webpack_require__(/*! ./modules/es6.string.includes */ 112);
	__webpack_require__(/*! ./modules/es6.string.repeat */ 113);
	__webpack_require__(/*! ./modules/es6.string.starts-with */ 114);
	__webpack_require__(/*! ./modules/es6.array.from */ 115);
	__webpack_require__(/*! ./modules/es6.array.of */ 116);
	__webpack_require__(/*! ./modules/es6.array.iterator */ 117);
	__webpack_require__(/*! ./modules/es6.array.species */ 118);
	__webpack_require__(/*! ./modules/es6.array.copy-within */ 119);
	__webpack_require__(/*! ./modules/es6.array.fill */ 120);
	__webpack_require__(/*! ./modules/es6.array.find */ 121);
	__webpack_require__(/*! ./modules/es6.array.find-index */ 122);
	__webpack_require__(/*! ./modules/es6.regexp */ 123);
	__webpack_require__(/*! ./modules/es6.promise */ 124);
	__webpack_require__(/*! ./modules/es6.map */ 125);
	__webpack_require__(/*! ./modules/es6.set */ 126);
	__webpack_require__(/*! ./modules/es6.weak-map */ 127);
	__webpack_require__(/*! ./modules/es6.weak-set */ 128);
	__webpack_require__(/*! ./modules/es6.reflect */ 129);
	__webpack_require__(/*! ./modules/es7.array.includes */ 130);
	__webpack_require__(/*! ./modules/es7.string.at */ 131);
	__webpack_require__(/*! ./modules/es7.regexp.escape */ 132);
	__webpack_require__(/*! ./modules/es7.object.get-own-property-descriptors */ 133);
	__webpack_require__(/*! ./modules/es7.object.to-array */ 134);
	__webpack_require__(/*! ./modules/js.array.statics */ 135);
	__webpack_require__(/*! ./modules/web.timers */ 136);
	__webpack_require__(/*! ./modules/web.immediate */ 137);
	__webpack_require__(/*! ./modules/web.dom.iterable */ 138);
	module.exports = __webpack_require__(/*! ./modules/$ */ 139).core;

/***/ },
/* 97 */
/*!******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.symbol.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $        = __webpack_require__(/*! ./$ */ 139)
	  , setTag   = __webpack_require__(/*! ./$.cof */ 141).set
	  , uid      = __webpack_require__(/*! ./$.uid */ 142)
	  , $def     = __webpack_require__(/*! ./$.def */ 143)
	  , keyOf    = __webpack_require__(/*! ./$.keyof */ 144)
	  , has      = $.has
	  , hide     = $.hide
	  , getNames = $.getNames
	  , toObject = $.toObject
	  , Symbol   = $.g.Symbol
	  , Base     = Symbol
	  , setter   = false
	  , TAG      = uid.safe('tag')
	  , SymbolRegistry = {}
	  , AllSymbols     = {};
	
	function wrap(tag){
	  var sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
	  $.DESC && setter && $.setDesc(Object.prototype, tag, {
	    configurable: true,
	    set: function(value){
	      hide(this, tag, value);
	    }
	  });
	  return sym;
	}
	
	// 19.4.1.1 Symbol([description])
	if(!$.isFunction(Symbol)){
	  Symbol = function(description){
	    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
	    return wrap(uid(description));
	  };
	  hide(Symbol.prototype, 'toString', function(){
	    return this[TAG];
	  });
	}
	$def($def.G + $def.W, {Symbol: Symbol});
	
	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  pure: uid.safe,
	  set: $.set,
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	    'species,split,toPrimitive,toStringTag,unscopables'
	  ).split(','), function(it){
	    var sym = __webpack_require__(/*! ./$.wks */ 145)(it);
	    symbolStatics[it] = Symbol === Base ? sym : wrap(sym);
	  }
	);
	
	setter = true;
	
	$def($def.S, 'Symbol', symbolStatics);
	
	$def($def.S + $def.F * (Symbol != Base), 'Object', {
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
	    return result;
	  },
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: function(it){
	    var names = getNames(toObject(it)), result = [], key, i = 0;
	    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
	    return result;
	  }
	});
	
	setTag(Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setTag($.g.JSON, 'JSON', true);

/***/ },
/* 98 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.object.assign.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.S, 'Object', {assign: __webpack_require__(/*! ./$.assign */ 146)});

/***/ },
/* 99 */
/*!*********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.object.is.js ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.10 Object.is(value1, value2)
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.S, 'Object', {
	  is: function(x, y){
	    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	  }
	});

/***/ },
/* 100 */
/*!***********************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.object.set-prototype-of.js ***!
  \***********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(/*! ./$.set-proto */ 147)});

/***/ },
/* 101 */
/*!****************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.object.to-string.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.3.6 Object.prototype.toString()
	var $   = __webpack_require__(/*! ./$ */ 139)
	  , cof = __webpack_require__(/*! ./$.cof */ 141)
	  , tmp = {};
	tmp[__webpack_require__(/*! ./$.wks */ 145)('toStringTag')] = 'z';
	if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
	  return '[object ' + cof.classof(this) + ']';
	});

/***/ },
/* 102 */
/*!********************************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.object.statics-accept-primitives.js ***!
  \********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 139)
	  , $def     = __webpack_require__(/*! ./$.def */ 143)
	  , isObject = $.isObject
	  , toObject = $.toObject;
	function wrapObjectMethod(METHOD, MODE){
	  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
	    , f   = 0
	    , o   = {};
	  o[METHOD] = MODE == 1 ? function(it){
	    return isObject(it) ? fn(it) : it;
	  } : MODE == 2 ? function(it){
	    return isObject(it) ? fn(it) : true;
	  } : MODE == 3 ? function(it){
	    return isObject(it) ? fn(it) : false;
	  } : MODE == 4 ? function(it, key){
	    return fn(toObject(it), key);
	  } : MODE == 5 ? function(it){
	    return fn(Object($.assertDefined(it)));
	  } : function(it){
	    return fn(toObject(it));
	  };
	  try {
	    fn('z');
	  } catch(e){
	    f = 1;
	  }
	  $def($def.S + $def.F * f, 'Object', o);
	}
	wrapObjectMethod('freeze', 1);
	wrapObjectMethod('seal', 1);
	wrapObjectMethod('preventExtensions', 1);
	wrapObjectMethod('isFrozen', 2);
	wrapObjectMethod('isSealed', 2);
	wrapObjectMethod('isExtensible', 3);
	wrapObjectMethod('getOwnPropertyDescriptor', 4);
	wrapObjectMethod('getPrototypeOf', 5);
	wrapObjectMethod('keys');
	wrapObjectMethod('getOwnPropertyNames');

/***/ },
/* 103 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.function.name.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , NAME = 'name'
	  , setDesc = $.setDesc
	  , FunctionProto = Function.prototype;
	// 19.2.4.2 name
	NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
	  configurable: true,
	  get: function(){
	    var match = String(this).match(/^\s*function ([^ (]*)/)
	      , name  = match ? match[1] : '';
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
	    return name;
	  },
	  set: function(value){
	    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
	  }
	});

/***/ },
/* 104 */
/*!******************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.number.constructor.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $          = __webpack_require__(/*! ./$ */ 139)
	  , isObject   = $.isObject
	  , isFunction = $.isFunction
	  , NUMBER     = 'Number'
	  , Number     = $.g[NUMBER]
	  , Base       = Number
	  , proto      = Number.prototype;
	function toPrimitive(it){
	  var fn, val;
	  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
	  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to number");
	}
	function toNumber(it){
	  if(isObject(it))it = toPrimitive(it);
	  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
	    var binary = false;
	    switch(it.charCodeAt(1)){
	      case 66 : case 98  : binary = true;
	      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
	    }
	  } return +it;
	}
	if($.FW && !(Number('0o1') && Number('0b1'))){
	  Number = function Number(it){
	    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
	  };
	  $.each.call($.DESC ? $.getNames(Base) : (
	      // ES3:
	      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	      // ES6 (in case, if modules with ES6 Number statics required before):
	      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	    ).split(','), function(key){
	      if($.has(Base, key) && !$.has(Number, key)){
	        $.setDesc(Number, key, $.getDesc(Base, key));
	      }
	    }
	  );
	  Number.prototype = proto;
	  proto.constructor = Number;
	  $.hide($.g, NUMBER, Number);
	}

/***/ },
/* 105 */
/*!**************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.number.statics.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 139)
	  , $def  = __webpack_require__(/*! ./$.def */ 143)
	  , abs   = Math.abs
	  , floor = Math.floor
	  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
	function isInteger(it){
	  return !$.isObject(it) && isFinite(it) && floor(it) === it;
	}
	$def($def.S, 'Number', {
	  // 20.1.2.1 Number.EPSILON
	  EPSILON: Math.pow(2, -52),
	  // 20.1.2.2 Number.isFinite(number)
	  isFinite: function(it){
	    return typeof it == 'number' && isFinite(it);
	  },
	  // 20.1.2.3 Number.isInteger(number)
	  isInteger: isInteger,
	  // 20.1.2.4 Number.isNaN(number)
	  isNaN: function(number){
	    return number != number;
	  },
	  // 20.1.2.5 Number.isSafeInteger(number)
	  isSafeInteger: function(number){
	    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
	  },
	  // 20.1.2.6 Number.MAX_SAFE_INTEGER
	  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
	  // 20.1.2.10 Number.MIN_SAFE_INTEGER
	  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
	  // 20.1.2.12 Number.parseFloat(string)
	  parseFloat: parseFloat,
	  // 20.1.2.13 Number.parseInt(string, radix)
	  parseInt: parseInt
	});

/***/ },
/* 106 */
/*!****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.math.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	var Infinity = 1 / 0
	  , $def  = __webpack_require__(/*! ./$.def */ 143)
	  , E     = Math.E
	  , pow   = Math.pow
	  , abs   = Math.abs
	  , exp   = Math.exp
	  , log   = Math.log
	  , sqrt  = Math.sqrt
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , sign  = Math.sign || function(x){
	      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	    };
	
	// 20.2.2.5 Math.asinh(x)
	function asinh(x){
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
	}
	// 20.2.2.14 Math.expm1(x)
	function expm1(x){
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
	}
	
	$def($def.S, 'Math', {
	  // 20.2.2.3 Math.acosh(x)
	  acosh: function(x){
	    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
	  },
	  // 20.2.2.5 Math.asinh(x)
	  asinh: asinh,
	  // 20.2.2.7 Math.atanh(x)
	  atanh: function(x){
	    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
	  },
	  // 20.2.2.9 Math.cbrt(x)
	  cbrt: function(x){
	    return sign(x = +x) * pow(abs(x), 1 / 3);
	  },
	  // 20.2.2.11 Math.clz32(x)
	  clz32: function(x){
	    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
	  },
	  // 20.2.2.12 Math.cosh(x)
	  cosh: function(x){
	    return (exp(x = +x) + exp(-x)) / 2;
	  },
	  // 20.2.2.14 Math.expm1(x)
	  expm1: expm1,
	  // 20.2.2.16 Math.fround(x)
	  // TODO: fallback for IE9-
	  fround: function(x){
	    return new Float32Array([x])[0];
	  },
	  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
	  hypot: function(value1, value2){ // eslint-disable-line no-unused-vars
	    var sum  = 0
	      , len1 = arguments.length
	      , len2 = len1
	      , args = Array(len1)
	      , larg = -Infinity
	      , arg;
	    while(len1--){
	      arg = args[len1] = +arguments[len1];
	      if(arg == Infinity || arg == -Infinity)return Infinity;
	      if(arg > larg)larg = arg;
	    }
	    larg = arg || 1;
	    while(len2--)sum += pow(args[len2] / larg, 2);
	    return larg * sqrt(sum);
	  },
	  // 20.2.2.18 Math.imul(x, y)
	  imul: function(x, y){
	    var UInt16 = 0xffff
	      , xn = +x
	      , yn = +y
	      , xl = UInt16 & xn
	      , yl = UInt16 & yn;
	    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
	  },
	  // 20.2.2.20 Math.log1p(x)
	  log1p: function(x){
	    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
	  },
	  // 20.2.2.21 Math.log10(x)
	  log10: function(x){
	    return log(x) / Math.LN10;
	  },
	  // 20.2.2.22 Math.log2(x)
	  log2: function(x){
	    return log(x) / Math.LN2;
	  },
	  // 20.2.2.28 Math.sign(x)
	  sign: sign,
	  // 20.2.2.30 Math.sinh(x)
	  sinh: function(x){
	    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
	  },
	  // 20.2.2.33 Math.tanh(x)
	  tanh: function(x){
	    var a = expm1(x = +x)
	      , b = expm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
	  },
	  // 20.2.2.34 Math.trunc(x)
	  trunc: function(it){
	    return (it > 0 ? floor : ceil)(it);
	  }
	});

/***/ },
/* 107 */
/*!**********************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.from-code-point.js ***!
  \**********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def    = __webpack_require__(/*! ./$.def */ 143)
	  , toIndex = __webpack_require__(/*! ./$ */ 139).toIndex
	  , fromCharCode = String.fromCharCode;
	
	$def($def.S, 'String', {
	  // 21.1.2.2 String.fromCodePoint(...codePoints)
	  fromCodePoint: function(x){ // eslint-disable-line no-unused-vars
	    var res = []
	      , len = arguments.length
	      , i   = 0
	      , code;
	    while(len > i){
	      code = +arguments[i++];
	      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
	      res.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
	      );
	    } return res.join('');
	  }
	});

/***/ },
/* 108 */
/*!**********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.raw.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $    = __webpack_require__(/*! ./$ */ 139)
	  , $def = __webpack_require__(/*! ./$.def */ 143);
	
	$def($def.S, 'String', {
	  // 21.1.2.4 String.raw(callSite, ...substitutions)
	  raw: function(callSite){
	    var raw = $.toObject(callSite.raw)
	      , len = $.toLength(raw.length)
	      , sln = arguments.length
	      , res = []
	      , i   = 0;
	    while(len > i){
	      res.push(String(raw[i++]));
	      if(i < sln)res.push(String(arguments[i]));
	    } return res.join('');
	  }
	});

/***/ },
/* 109 */
/*!***************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.iterator.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var set   = __webpack_require__(/*! ./$ */ 139).set
	  , at    = __webpack_require__(/*! ./$.string-at */ 148)(true)
	  , ITER  = __webpack_require__(/*! ./$.uid */ 142).safe('iter')
	  , $iter = __webpack_require__(/*! ./$.iter */ 149)
	  , step  = $iter.step;
	
	// 21.1.3.27 String.prototype[@@iterator]()
	$iter.std(String, 'String', function(iterated){
	  set(this, ITER, {o: String(iterated), i: 0});
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , index = iter.i
	    , point;
	  if(index >= O.length)return step(1);
	  point = at.call(O, index);
	  iter.i += point.length;
	  return step(0, point);
	});

/***/ },
/* 110 */
/*!********************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.code-point-at.js ***!
  \********************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.P, 'String', {
	  // 21.1.3.3 String.prototype.codePointAt(pos)
	  codePointAt: __webpack_require__(/*! ./$.string-at */ 148)(false)
	});

/***/ },
/* 111 */
/*!****************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.ends-with.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , cof  = __webpack_require__(/*! ./$.cof */ 141)
	  , $def = __webpack_require__(/*! ./$.def */ 143)
	  , toLength = $.toLength;
	
	$def($def.P, 'String', {
	  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
	  endsWith: function(searchString /*, endPosition = @length */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that = String($.assertDefined(this))
	      , endPosition = arguments[1]
	      , len = toLength(that.length)
	      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
	    searchString += '';
	    return that.slice(end - searchString.length, end) === searchString;
	  }
	});

/***/ },
/* 112 */
/*!***************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.includes.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , cof  = __webpack_require__(/*! ./$.cof */ 141)
	  , $def = __webpack_require__(/*! ./$.def */ 143);
	
	$def($def.P, 'String', {
	  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
	  includes: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
	  }
	});

/***/ },
/* 113 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.repeat.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , $def = __webpack_require__(/*! ./$.def */ 143);
	
	$def($def.P, 'String', {
	  // 21.1.3.13 String.prototype.repeat(count)
	  repeat: function(count){
	    var str = String($.assertDefined(this))
	      , res = ''
	      , n   = $.toInteger(count);
	    if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
	    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
	    return res;
	  }
	});

/***/ },
/* 114 */
/*!******************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.string.starts-with.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , cof  = __webpack_require__(/*! ./$.cof */ 141)
	  , $def = __webpack_require__(/*! ./$.def */ 143);
	
	$def($def.P, 'String', {
	  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
	  startsWith: function(searchString /*, position = 0 */){
	    if(cof(searchString) == 'RegExp')throw TypeError();
	    var that  = String($.assertDefined(this))
	      , index = $.toLength(Math.min(arguments[1], that.length));
	    searchString += '';
	    return that.slice(index, index + searchString.length) === searchString;
	  }
	});

/***/ },
/* 115 */
/*!**********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.from.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $     = __webpack_require__(/*! ./$ */ 139)
	  , ctx   = __webpack_require__(/*! ./$.ctx */ 150)
	  , $def  = __webpack_require__(/*! ./$.def */ 143)
	  , $iter = __webpack_require__(/*! ./$.iter */ 149)
	  , stepCall = $iter.stepCall;
	$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = Object($.assertDefined(arrayLike))
	      , mapfn   = arguments[1]
	      , mapping = mapfn !== undefined
	      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
	      , index   = 0
	      , length, result, step, iterator;
	    if($iter.is(O)){
	      iterator = $iter.get(O);
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result   = new (typeof this == 'function' ? this : Array);
	      for(; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
	      }
	    } else {
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
	      for(; length > index; index++){
	        result[index] = mapping ? f(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});

/***/ },
/* 116 */
/*!********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.of.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.S, 'Array', {
	  // 22.1.2.3 Array.of( ...items)
	  of: function(/* ...args */){
	    var index  = 0
	      , length = arguments.length
	      // strange IE quirks mode bug -> use typeof instead of isFunction
	      , result = new (typeof this == 'function' ? this : Array)(length);
	    while(length > index)result[index] = arguments[index++];
	    result.length = length;
	    return result;
	  }
	});

/***/ },
/* 117 */
/*!**************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.iterator.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 139)
	  , setUnscope = __webpack_require__(/*! ./$.unscope */ 151)
	  , ITER       = __webpack_require__(/*! ./$.uid */ 142).safe('iter')
	  , $iter      = __webpack_require__(/*! ./$.iter */ 149)
	  , step       = $iter.step
	  , Iterators  = $iter.Iterators;
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	$iter.std(Array, 'Array', function(iterated, kind){
	  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , kind  = iter.k
	    , index = iter.i++;
	  if(!O || index >= O.length){
	    iter.o = undefined;
	    return step(1);
	  }
	  if(kind == 'key'  )return step(0, index);
	  if(kind == 'value')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'value');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 118 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.species.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./$.species */ 152)(Array);

/***/ },
/* 119 */
/*!*****************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.copy-within.js ***!
  \*****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
	  copyWithin: function(target/* = 0 */, start /* = 0, end = @length */){
	    var O     = Object($.assertDefined(this))
	      , len   = $.toLength(O.length)
	      , to    = toIndex(target, len)
	      , from  = toIndex(start, len)
	      , end   = arguments[2]
	      , fin   = end === undefined ? len : toIndex(end, len)
	      , count = Math.min(fin - from, len - to)
	      , inc   = 1;
	    if(from < to && to < from + count){
	      inc  = -1;
	      from = from + count - 1;
	      to   = to   + count - 1;
	    }
	    while(count-- > 0){
	      if(from in O)O[to] = O[from];
	      else delete O[to];
	      to   += inc;
	      from += inc;
	    } return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 151)('copyWithin');

/***/ },
/* 120 */
/*!**********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.fill.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , toIndex = $.toIndex;
	$def($def.P, 'Array', {
	  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
	  fill: function(value /*, start = 0, end = @length */){
	    var O      = Object($.assertDefined(this))
	      , length = $.toLength(O.length)
	      , index  = toIndex(arguments[1], length)
	      , end    = arguments[2]
	      , endPos = end === undefined ? length : toIndex(end, length);
	    while(endPos > index)O[index++] = value;
	    return O;
	  }
	});
	__webpack_require__(/*! ./$.unscope */ 151)('fill');

/***/ },
/* 121 */
/*!**********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.find.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.P, 'Array', {
	  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
	  find: __webpack_require__(/*! ./$.array-methods */ 153)(5)
	});
	__webpack_require__(/*! ./$.unscope */ 151)('find');

/***/ },
/* 122 */
/*!****************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.array.find-index.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.P, 'Array', {
	  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
	  findIndex: __webpack_require__(/*! ./$.array-methods */ 153)(6)
	});
	__webpack_require__(/*! ./$.unscope */ 151)('findIndex');

/***/ },
/* 123 */
/*!******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.regexp.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $      = __webpack_require__(/*! ./$ */ 139)
	  , cof    = __webpack_require__(/*! ./$.cof */ 141)
	  , RegExp = $.g.RegExp
	  , Base   = RegExp
	  , proto  = RegExp.prototype;
	if($.FW && $.DESC){
	  // RegExp allows a regex with flags as the pattern
	  if(!function(){try{ return RegExp(/a/g, 'i') == '/a/i'; }catch(e){ /* empty */ }}()){
	    RegExp = function RegExp(pattern, flags){
	      return new Base(cof(pattern) == 'RegExp' && flags !== undefined
	        ? pattern.source : pattern, flags);
	    };
	    $.each.call($.getNames(Base), function(key){
	      key in RegExp || $.setDesc(RegExp, key, {
	        configurable: true,
	        get: function(){ return Base[key]; },
	        set: function(it){ Base[key] = it; }
	      });
	    });
	    proto.constructor = RegExp;
	    RegExp.prototype = proto;
	    $.hide($.g, 'RegExp', RegExp);
	  }
	  // 21.2.5.3 get RegExp.prototype.flags()
	  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
	    configurable: true,
	    get: __webpack_require__(/*! ./$.replacer */ 154)(/^.*\/(\w*)$/, '$1')
	  });
	}
	__webpack_require__(/*! ./$.species */ 152)(RegExp);

/***/ },
/* 124 */
/*!*******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.promise.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , ctx     = __webpack_require__(/*! ./$.ctx */ 150)
	  , cof     = __webpack_require__(/*! ./$.cof */ 141)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , assert  = __webpack_require__(/*! ./$.assert */ 155)
	  , $iter   = __webpack_require__(/*! ./$.iter */ 149)
	  , SPECIES = __webpack_require__(/*! ./$.wks */ 145)('species')
	  , RECORD  = __webpack_require__(/*! ./$.uid */ 142).safe('record')
	  , forOf   = $iter.forOf
	  , PROMISE = 'Promise'
	  , global  = $.g
	  , process = global.process
	  , asap    = process && process.nextTick || __webpack_require__(/*! ./$.task */ 156).set
	  , Promise = global[PROMISE]
	  , Base    = Promise
	  , isFunction     = $.isFunction
	  , isObject       = $.isObject
	  , assertFunction = assert.fn
	  , assertObject   = assert.obj
	  , test;
	function getConstructor(C){
	  var S = assertObject(C)[SPECIES];
	  return S != undefined ? S : C;
	}
	isFunction(Promise) && isFunction(Promise.resolve)
	&& Promise.resolve(test = new Promise(function(){})) == test
	|| function(){
	  function isThenable(it){
	    var then;
	    if(isObject(it))then = it.then;
	    return isFunction(then) ? then : false;
	  }
	  function handledRejectionOrHasOnRejected(promise){
	    var record = promise[RECORD]
	      , chain  = record.c
	      , i      = 0
	      , react;
	    if(record.h)return true;
	    while(chain.length > i){
	      react = chain[i++];
	      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
	    }
	  }
	  function notify(record, isReject){
	    var chain = record.c;
	    if(isReject || chain.length)asap(function(){
	      var promise = record.p
	        , value   = record.v
	        , ok      = record.s == 1
	        , i       = 0;
	      if(isReject && !handledRejectionOrHasOnRejected(promise)){
	        setTimeout(function(){
	          if(!handledRejectionOrHasOnRejected(promise)){
	            if(cof(process) == 'process'){
	              process.emit('unhandledRejection', value, promise);
	            } else if(global.console && isFunction(console.error)){
	              console.error('Unhandled promise rejection', value);
	            }
	          }
	        }, 1e3);
	      } else while(chain.length > i)!function(react){
	        var cb = ok ? react.ok : react.fail
	          , ret, then;
	        try {
	          if(cb){
	            if(!ok)record.h = true;
	            ret = cb === true ? value : cb(value);
	            if(ret === react.P){
	              react.rej(TypeError(PROMISE + '-chain cycle'));
	            } else if(then = isThenable(ret)){
	              then.call(ret, react.res, react.rej);
	            } else react.res(ret);
	          } else react.rej(value);
	        } catch(err){
	          react.rej(err);
	        }
	      }(chain[i++]);
	      chain.length = 0;
	    });
	  }
	  function reject(value){
	    var record = this;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    record.v = value;
	    record.s = 2;
	    notify(record, true);
	  }
	  function resolve(value){
	    var record = this
	      , then, wrapper;
	    if(record.d)return;
	    record.d = true;
	    record = record.r || record; // unwrap
	    try {
	      if(then = isThenable(value)){
	        wrapper = {r: record, d: false}; // wrap
	        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
	      } else {
	        record.v = value;
	        record.s = 1;
	        notify(record);
	      }
	    } catch(err){
	      reject.call(wrapper || {r: record, d: false}, err); // wrap
	    }
	  }
	  // 25.4.3.1 Promise(executor)
	  Promise = function(executor){
	    assertFunction(executor);
	    var record = {
	      p: assert.inst(this, Promise, PROMISE), // <- promise
	      c: [],                                  // <- chain
	      s: 0,                                   // <- state
	      d: false,                               // <- done
	      v: undefined,                           // <- value
	      h: false                                // <- handled rejection
	    };
	    $.hide(this, RECORD, record);
	    try {
	      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
	    } catch(err){
	      reject.call(record, err);
	    }
	  };
	  $.mix(Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function(onFulfilled, onRejected){
	      var S = assertObject(assertObject(this).constructor)[SPECIES];
	      var react = {
	        ok:   isFunction(onFulfilled) ? onFulfilled : true,
	        fail: isFunction(onRejected)  ? onRejected  : false
	      };
	      var P = react.P = new (S != undefined ? S : Promise)(function(res, rej){
	        react.res = assertFunction(res);
	        react.rej = assertFunction(rej);
	      });
	      var record = this[RECORD];
	      record.c.push(react);
	      record.s && notify(record);
	      return P;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	}();
	$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
	$def($def.S, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function(r){
	    return new (getConstructor(this))(function(res, rej){
	      rej(r);
	    });
	  },
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function(x){
	    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
	      ? x : new (getConstructor(this))(function(res){
	        res(x);
	      });
	  }
	});
	$def($def.S + $def.F * ($iter.fail(function(iter){
	  Promise.all(iter)['catch'](function(){});
	}) || $iter.DANGER_CLOSING), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function(iterable){
	    var C      = getConstructor(this)
	      , values = [];
	    return new C(function(resolve, reject){
	      forOf(iterable, false, values.push, values);
	      var remaining = values.length
	        , results   = Array(remaining);
	      if(remaining)$.each.call(values, function(promise, index){
	        C.resolve(promise).then(function(value){
	          results[index] = value;
	          --remaining || resolve(results);
	        }, reject);
	      });
	      else resolve(results);
	    });
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function(iterable){
	    var C = getConstructor(this);
	    return new C(function(resolve, reject){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(resolve, reject);
	      });
	    });
	  }
	});
	cof.set(Promise, PROMISE);
	__webpack_require__(/*! ./$.species */ 152)(Promise);

/***/ },
/* 125 */
/*!***************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.map.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 157);
	
	// 23.1 Map Objects
	__webpack_require__(/*! ./$.collection */ 158)('Map', {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 126 */
/*!***************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.set.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(/*! ./$.collection-strong */ 157);
	
	// 23.2 Set Objects
	__webpack_require__(/*! ./$.collection */ 158)('Set', {
	  // 23.2.3.1 Set.prototype.add(value)
	  add: function(value){
	    return strong.def(this, value = value === 0 ? 0 : value, value);
	  }
	}, strong);

/***/ },
/* 127 */
/*!********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.weak-map.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 139)
	  , weak      = __webpack_require__(/*! ./$.collection-weak */ 159)
	  , leakStore = weak.leakStore
	  , ID        = weak.ID
	  , WEAK      = weak.WEAK
	  , has       = $.has
	  , isObject  = $.isObject
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , tmp       = {};
	
	// 23.3 WeakMap Objects
	var WeakMap = __webpack_require__(/*! ./$.collection */ 158)('WeakMap', {
	  // 23.3.3.3 WeakMap.prototype.get(key)
	  get: function(key){
	    if(isObject(key)){
	      if(isFrozen(key))return leakStore(this).get(key);
	      if(has(key, WEAK))return key[WEAK][this[ID]];
	    }
	  },
	  // 23.3.3.5 WeakMap.prototype.set(key, value)
	  set: function(key, value){
	    return weak.def(this, key, value);
	  }
	}, weak, true, true);
	
	// IE11 WeakMap frozen keys fix
	if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
	  $.each.call(['delete', 'has', 'get', 'set'], function(key){
	    var method = WeakMap.prototype[key];
	    WeakMap.prototype[key] = function(a, b){
	      // store frozen objects on leaky map
	      if(isObject(a) && isFrozen(a)){
	        var result = leakStore(this)[key](a, b);
	        return key == 'set' ? this : result;
	      // store all the rest on native weakmap
	      } return method.call(this, a, b);
	    };
	  });
	}

/***/ },
/* 128 */
/*!********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.weak-set.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var weak = __webpack_require__(/*! ./$.collection-weak */ 159);
	
	// 23.4 WeakSet Objects
	__webpack_require__(/*! ./$.collection */ 158)('WeakSet', {
	  // 23.4.3.1 WeakSet.prototype.add(value)
	  add: function(value){
	    return weak.def(this, value, true);
	  }
	}, weak, false, true);

/***/ },
/* 129 */
/*!*******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es6.reflect.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(/*! ./$ */ 139)
	  , $def      = __webpack_require__(/*! ./$.def */ 143)
	  , setProto  = __webpack_require__(/*! ./$.set-proto */ 147)
	  , $iter     = __webpack_require__(/*! ./$.iter */ 149)
	  , ITER      = __webpack_require__(/*! ./$.uid */ 142).safe('iter')
	  , step      = $iter.step
	  , assert    = __webpack_require__(/*! ./$.assert */ 155)
	  , isObject  = $.isObject
	  , getDesc   = $.getDesc
	  , setDesc   = $.setDesc
	  , getProto  = $.getProto
	  , apply     = Function.apply
	  , assertObject = assert.obj
	  , isExtensible = Object.isExtensible || $.it;
	function Enumerate(iterated){
	  var keys = [], key;
	  for(key in iterated)keys.push(key);
	  $.set(this, ITER, {o: iterated, a: keys, i: 0});
	}
	$iter.create(Enumerate, 'Object', function(){
	  var iter = this[ITER]
	    , keys = iter.a
	    , key;
	  do {
	    if(iter.i >= keys.length)return step(1);
	  } while(!((key = keys[iter.i++]) in iter.o));
	  return step(0, key);
	});
	
	function wrap(fn){
	  return function(it){
	    assertObject(it);
	    try {
	      fn.apply(undefined, arguments);
	      return true;
	    } catch(e){
	      return false;
	    }
	  };
	}
	
	function reflectGet(target, propertyKey/*, receiver*/){
	  var receiver = arguments.length < 3 ? target : arguments[2]
	    , desc = getDesc(assertObject(target), propertyKey), proto;
	  if(desc)return $.has(desc, 'value')
	    ? desc.value
	    : desc.get === undefined
	      ? undefined
	      : desc.get.call(receiver);
	  return isObject(proto = getProto(target))
	    ? reflectGet(proto, propertyKey, receiver)
	    : undefined;
	}
	function reflectSet(target, propertyKey, V/*, receiver*/){
	  var receiver = arguments.length < 4 ? target : arguments[3]
	    , ownDesc  = getDesc(assertObject(target), propertyKey)
	    , existingDescriptor, proto;
	  if(!ownDesc){
	    if(isObject(proto = getProto(target))){
	      return reflectSet(proto, propertyKey, V, receiver);
	    }
	    ownDesc = $.desc(0);
	  }
	  if($.has(ownDesc, 'value')){
	    if(ownDesc.writable === false || !isObject(receiver))return false;
	    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
	    existingDescriptor.value = V;
	    setDesc(receiver, propertyKey, existingDescriptor);
	    return true;
	  }
	  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
	}
	
	var reflect = {
	  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
	  apply: __webpack_require__(/*! ./$.ctx */ 150)(Function.call, apply, 3),
	  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
	  construct: function(target, argumentsList /*, newTarget*/){
	    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
	      , instance = $.create(isObject(proto) ? proto : Object.prototype)
	      , result   = apply.call(target, instance, argumentsList);
	    return isObject(result) ? result : instance;
	  },
	  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
	  defineProperty: wrap(setDesc),
	  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
	  deleteProperty: function(target, propertyKey){
	    var desc = getDesc(assertObject(target), propertyKey);
	    return desc && !desc.configurable ? false : delete target[propertyKey];
	  },
	  // 26.1.5 Reflect.enumerate(target)
	  enumerate: function(target){
	    return new Enumerate(assertObject(target));
	  },
	  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
	  get: reflectGet,
	  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
	  getOwnPropertyDescriptor: function(target, propertyKey){
	    return getDesc(assertObject(target), propertyKey);
	  },
	  // 26.1.8 Reflect.getPrototypeOf(target)
	  getPrototypeOf: function(target){
	    return getProto(assertObject(target));
	  },
	  // 26.1.9 Reflect.has(target, propertyKey)
	  has: function(target, propertyKey){
	    return propertyKey in target;
	  },
	  // 26.1.10 Reflect.isExtensible(target)
	  isExtensible: function(target){
	    return !!isExtensible(assertObject(target));
	  },
	  // 26.1.11 Reflect.ownKeys(target)
	  ownKeys: __webpack_require__(/*! ./$.own-keys */ 160),
	  // 26.1.12 Reflect.preventExtensions(target)
	  preventExtensions: wrap(Object.preventExtensions || $.it),
	  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
	  set: reflectSet
	};
	// 26.1.14 Reflect.setPrototypeOf(target, proto)
	if(setProto)reflect.setPrototypeOf = function(target, proto){
	  setProto(assertObject(target), proto);
	  return true;
	};
	
	$def($def.G, {Reflect: {}});
	$def($def.S, 'Reflect', reflect);

/***/ },
/* 130 */
/*!**************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es7.array.includes.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/domenic/Array.prototype.includes
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.P, 'Array', {
	  includes: __webpack_require__(/*! ./$.array-includes */ 161)(true)
	});
	__webpack_require__(/*! ./$.unscope */ 151)('includes');

/***/ },
/* 131 */
/*!*********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es7.string.at.js ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/mathiasbynens/String.prototype.at
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.P, 'String', {
	  at: __webpack_require__(/*! ./$.string-at */ 148)(true)
	});

/***/ },
/* 132 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es7.regexp.escape.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/kangax/9698100
	var $def = __webpack_require__(/*! ./$.def */ 143);
	$def($def.S, 'RegExp', {
	  escape: __webpack_require__(/*! ./$.replacer */ 154)(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
	});

/***/ },
/* 133 */
/*!***********************************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es7.object.get-own-property-descriptors.js ***!
  \***********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// https://gist.github.com/WebReflection/9353781
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , ownKeys = __webpack_require__(/*! ./$.own-keys */ 160);
	
	$def($def.S, 'Object', {
	  getOwnPropertyDescriptors: function(object){
	    var O      = $.toObject(object)
	      , result = {};
	    $.each.call(ownKeys(O), function(key){
	      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
	    });
	    return result;
	  }
	});

/***/ },
/* 134 */
/*!***************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es7.object.to-array.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// http://goo.gl/XkBrjD
	var $    = __webpack_require__(/*! ./$ */ 139)
	  , $def = __webpack_require__(/*! ./$.def */ 143);
	function createObjectToArray(isEntries){
	  return function(object){
	    var O      = $.toObject(object)
	      , keys   = $.getKeys(object)
	      , length = keys.length
	      , i      = 0
	      , result = Array(length)
	      , key;
	    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
	    else while(length > i)result[i] = O[keys[i++]];
	    return result;
	  };
	}
	$def($def.S, 'Object', {
	  values:  createObjectToArray(false),
	  entries: createObjectToArray(true)
	});

/***/ },
/* 135 */
/*!************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/js.array.statics.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	// JavaScript 1.6 / Strawman array statics shim
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , core    = $.core
	  , statics = {};
	function setStatics(keys, length){
	  $.each.call(keys.split(','), function(key){
	    if(length == undefined && key in core.Array)statics[key] = core.Array[key];
	    else if(key in [])statics[key] = __webpack_require__(/*! ./$.ctx */ 150)(Function.call, [][key], length);
	  });
	}
	setStatics('pop,reverse,shift,keys,values,entries', 1);
	setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
	setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
	           'reduce,reduceRight,copyWithin,fill,turn');
	$def($def.S, 'Array', statics);

/***/ },
/* 136 */
/*!******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/web.timers.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	// ie9- setTimeout & setInterval additional parameters fix
	var $       = __webpack_require__(/*! ./$ */ 139)
	  , $def    = __webpack_require__(/*! ./$.def */ 143)
	  , invoke  = __webpack_require__(/*! ./$.invoke */ 162)
	  , partial = __webpack_require__(/*! ./$.partial */ 163)
	  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
	function wrap(set){
	  return MSIE ? function(fn, time /*, ...args */){
	    return set(invoke(
	      partial,
	      [].slice.call(arguments, 2),
	      $.isFunction(fn) ? fn : Function(fn)
	    ), time);
	  } : set;
	}
	$def($def.G + $def.B + $def.F * MSIE, {
	  setTimeout:  wrap($.g.setTimeout),
	  setInterval: wrap($.g.setInterval)
	});

/***/ },
/* 137 */
/*!*********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/web.immediate.js ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $def  = __webpack_require__(/*! ./$.def */ 143)
	  , $task = __webpack_require__(/*! ./$.task */ 156);
	$def($def.G + $def.B, {
	  setImmediate:   $task.set,
	  clearImmediate: $task.clear
	});

/***/ },
/* 138 */
/*!************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/web.dom.iterable.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./es6.array.iterator */ 117);
	var $         = __webpack_require__(/*! ./$ */ 139)
	  , Iterators = __webpack_require__(/*! ./$.iter */ 149).Iterators
	  , ITERATOR  = __webpack_require__(/*! ./$.wks */ 145)('iterator')
	  , NodeList  = $.g.NodeList;
	if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
	  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
	}
	Iterators.NodeList = Iterators.Array;

/***/ },
/* 139 */
/*!*********************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global = typeof self != 'undefined' ? self : Function('return this')()
	  , core   = {}
	  , defineProperty = Object.defineProperty
	  , hasOwnProperty = {}.hasOwnProperty
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , max   = Math.max
	  , min   = Math.min;
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	  try {
	    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
	  } catch(e){ /* empty */ }
	}();
	var hide = createDefiner(1);
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	}
	function desc(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
	  } : simpleSet;
	}
	
	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	}
	
	var $ = module.exports = __webpack_require__(/*! ./$.fw */ 164)({
	  g: global,
	  core: core,
	  html: global.document && document.documentElement,
	  // http://jsperf.com/core-js-isobject
	  isObject:   isObject,
	  isFunction: isFunction,
	  it: function(it){
	    return it;
	  },
	  that: function(){
	    return this;
	  },
	  // 7.1.4 ToInteger
	  toInteger: toInteger,
	  // 7.1.15 ToLength
	  toLength: function(it){
	    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	  },
	  toIndex: function(index, length){
	    index = toInteger(index);
	    return index < 0 ? max(index + length, 0) : min(index, length);
	  },
	  has: function(it, key){
	    return hasOwnProperty.call(it, key);
	  },
	  create:     Object.create,
	  getProto:   Object.getPrototypeOf,
	  DESC:       DESC,
	  desc:       desc,
	  getDesc:    Object.getOwnPropertyDescriptor,
	  setDesc:    defineProperty,
	  getKeys:    Object.keys,
	  getNames:   Object.getOwnPropertyNames,
	  getSymbols: Object.getOwnPropertySymbols,
	  // Dummy, fix for not array-like ES3 string in es5 module
	  assertDefined: assertDefined,
	  ES5Object: Object,
	  toObject: function(it){
	    return $.ES5Object(assertDefined(it));
	  },
	  hide: hide,
	  def: createDefiner(0),
	  set: global.Symbol ? simpleSet : hide,
	  mix: function(target, src){
	    for(var key in src)hide(target, key, src[key]);
	    return target;
	  },
	  each: [].forEach
	});
	if(typeof __e != 'undefined')__e = core;
	if(typeof __g != 'undefined')__g = global;

/***/ },
/* 140 */
/*!***********************************************!*\
  !*** ./~/babel-core/~/core-js/modules/es5.js ***!
  \***********************************************/
/***/ function(module, exports, __webpack_require__) {

	var $                = __webpack_require__(/*! ./$ */ 139)
	  , cof              = __webpack_require__(/*! ./$.cof */ 141)
	  , $def             = __webpack_require__(/*! ./$.def */ 143)
	  , invoke           = __webpack_require__(/*! ./$.invoke */ 162)
	  , arrayMethod      = __webpack_require__(/*! ./$.array-methods */ 153)
	  , IE_PROTO         = __webpack_require__(/*! ./$.uid */ 142).safe('__proto__')
	  , assert           = __webpack_require__(/*! ./$.assert */ 155)
	  , assertObject     = assert.obj
	  , ObjectProto      = Object.prototype
	  , A                = []
	  , slice            = A.slice
	  , indexOf          = A.indexOf
	  , classof          = cof.classof
	  , defineProperties = Object.defineProperties
	  , has              = $.has
	  , defineProperty   = $.setDesc
	  , getOwnDescriptor = $.getDesc
	  , isFunction       = $.isFunction
	  , toObject         = $.toObject
	  , toLength         = $.toLength
	  , IE8_DOM_DEFINE   = false;
	
	if(!$.DESC){
	  try {
	    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
	      {get: function(){ return 8; }}
	    ).x == 8;
	  } catch(e){ /* empty */ }
	  $.setDesc = function(O, P, Attributes){
	    if(IE8_DOM_DEFINE)try {
	      return defineProperty(O, P, Attributes);
	    } catch(e){ /* empty */ }
	    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
	    return O;
	  };
	  $.getDesc = function(O, P){
	    if(IE8_DOM_DEFINE)try {
	      return getOwnDescriptor(O, P);
	    } catch(e){ /* empty */ }
	    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
	  };
	  defineProperties = function(O, Properties){
	    assertObject(O);
	    var keys   = $.getKeys(Properties)
	      , length = keys.length
	      , i = 0
	      , P;
	    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
	    return O;
	  };
	}
	$def($def.S + $def.F * !$.DESC, 'Object', {
	  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $.getDesc,
	  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	  defineProperty: $.setDesc,
	  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
	  defineProperties: defineProperties
	});
	
	  // IE 8- don't enum bug keys
	var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
	            'toLocaleString,toString,valueOf').split(',')
	  // Additional keys for getOwnPropertyNames
	  , keys2 = keys1.concat('length', 'prototype')
	  , keysLen1 = keys1.length;
	
	// Create object with `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = document.createElement('iframe')
	    , i      = keysLen1
	    , iframeDocument;
	  iframe.style.display = 'none';
	  $.html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write('<script>document.F=Object</script>');
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict.prototype[keys1[i]];
	  return createDict();
	};
	function createGetKeys(names, length){
	  return function(object){
	    var O      = toObject(object)
	      , i      = 0
	      , result = []
	      , key;
	    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	    // Don't enum bug & hidden keys
	    while(length > i)if(has(O, key = names[i++])){
	      ~indexOf.call(result, key) || result.push(key);
	    }
	    return result;
	  };
	}
	function isPrimitive(it){ return !$.isObject(it); }
	function Empty(){}
	$def($def.S, 'Object', {
	  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	  getPrototypeOf: $.getProto = $.getProto || function(O){
	    O = Object(assert.def(O));
	    if(has(O, IE_PROTO))return O[IE_PROTO];
	    if(isFunction(O.constructor) && O instanceof O.constructor){
	      return O.constructor.prototype;
	    } return O instanceof Object ? ObjectProto : null;
	  },
	  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
	  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	  create: $.create = $.create || function(O, /*?*/Properties){
	    var result;
	    if(O !== null){
	      Empty.prototype = assertObject(O);
	      result = new Empty();
	      Empty.prototype = null;
	      // add "__proto__" for Object.getPrototypeOf shim
	      result[IE_PROTO] = O;
	    } else result = createDict();
	    return Properties === undefined ? result : defineProperties(result, Properties);
	  },
	  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
	  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
	  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
	  seal: $.it, // <- cap
	  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
	  freeze: $.it, // <- cap
	  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
	  preventExtensions: $.it, // <- cap
	  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
	  isSealed: isPrimitive, // <- cap
	  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
	  isFrozen: isPrimitive, // <- cap
	  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
	  isExtensible: $.isObject // <- cap
	});
	
	// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
	$def($def.P, 'Function', {
	  bind: function(that /*, args... */){
	    var fn       = assert.fn(this)
	      , partArgs = slice.call(arguments, 1);
	    function bound(/* args... */){
	      var args = partArgs.concat(slice.call(arguments));
	      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
	    }
	    if(fn.prototype)bound.prototype = fn.prototype;
	    return bound;
	  }
	});
	
	// Fix for not array-like ES3 string
	function arrayMethodFix(fn){
	  return function(){
	    return fn.apply($.ES5Object(this), arguments);
	  };
	}
	if(!(0 in Object('z') && 'z'[0] == 'z')){
	  $.ES5Object = function(it){
	    return cof(it) == 'String' ? it.split('') : Object(it);
	  };
	}
	$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
	  slice: arrayMethodFix(slice),
	  join: arrayMethodFix(A.join)
	});
	
	// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
	$def($def.S, 'Array', {
	  isArray: function(arg){
	    return cof(arg) == 'Array';
	  }
	});
	function createArrayReduce(isRight){
	  return function(callbackfn, memo){
	    assert.fn(callbackfn);
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = isRight ? length - 1 : 0
	      , i      = isRight ? -1 : 1;
	    if(arguments.length < 2)for(;;){
	      if(index in O){
	        memo = O[index];
	        index += i;
	        break;
	      }
	      index += i;
	      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
	    }
	    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
	      memo = callbackfn(memo, O[index], index, this);
	    }
	    return memo;
	  };
	}
	$def($def.P, 'Array', {
	  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
	  forEach: $.each = $.each || arrayMethod(0),
	  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
	  map: arrayMethod(1),
	  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
	  filter: arrayMethod(2),
	  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
	  some: arrayMethod(3),
	  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
	  every: arrayMethod(4),
	  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
	  reduce: createArrayReduce(false),
	  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
	  reduceRight: createArrayReduce(true),
	  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
	  indexOf: indexOf = indexOf || __webpack_require__(/*! ./$.array-includes */ 161)(false),
	  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
	  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
	    var O      = toObject(this)
	      , length = toLength(O.length)
	      , index  = length - 1;
	    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
	    if(index < 0)index = toLength(length + index);
	    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
	    return -1;
	  }
	});
	
	// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
	$def($def.P, 'String', {trim: __webpack_require__(/*! ./$.replacer */ 154)(/^\s*([\s\S]*\S)?\s*$/, '$1')});
	
	// 20.3.3.1 / 15.9.4.4 Date.now()
	$def($def.S, 'Date', {now: function(){
	  return +new Date;
	}});
	
	function lz(num){
	  return num > 9 ? num : '0' + num;
	}
	// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
	$def($def.P, 'Date', {toISOString: function(){
	  if(!isFinite(this))throw RangeError('Invalid time value');
	  var d = this
	    , y = d.getUTCFullYear()
	    , m = d.getUTCMilliseconds()
	    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
	  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
	    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
	    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
	    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
	}});
	
	if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
	  var tag = classof(it);
	  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
	};

/***/ },
/* 141 */
/*!*************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.cof.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(/*! ./$ */ 139)
	  , TAG      = __webpack_require__(/*! ./$.wks */ 145)('toStringTag')
	  , toString = {}.toString;
	function cof(it){
	  return toString.call(it).slice(8, -1);
	}
	cof.classof = function(it){
	  var O, T;
	  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
	};
	cof.set = function(it, tag, stat){
	  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
	};
	module.exports = cof;

/***/ },
/* 142 */
/*!*************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.uid.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	var sid = 0;
	function uid(key){
	  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
	}
	uid.safe = __webpack_require__(/*! ./$ */ 139).g.Symbol || uid;
	module.exports = uid;

/***/ },
/* 143 */
/*!*************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.def.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(/*! ./$ */ 139)
	  , global     = $.g
	  , core       = $.core
	  , isFunction = $.isFunction;
	function ctx(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	}
	global.core = core;
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	function $def(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {}).prototype
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    if(type & $def.B && own)exp = ctx(out, global);
	    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
	    // extend global
	    if(target && !own){
	      if(isGlobal)target[key] = out;
	      else delete target[key] && $.hide(target, key, out);
	    }
	    // export
	    if(exports[key] != out)$.hide(exports, key, exp);
	  }
	}
	module.exports = $def;

/***/ },
/* 144 */
/*!***************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.keyof.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 139);
	module.exports = function(object, el){
	  var O      = $.toObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 145 */
/*!*************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.wks.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(/*! ./$ */ 139).g
	  , store  = {};
	module.exports = function(name){
	  return store[name] || (store[name] =
	    global.Symbol && global.Symbol[name] || __webpack_require__(/*! ./$.uid */ 142).safe('Symbol.' + name));
	};

/***/ },
/* 146 */
/*!****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.assign.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 139);
	// 19.1.2.1 Object.assign(target, source, ...)
	module.exports = Object.assign || function(target, source){ // eslint-disable-line no-unused-vars
	  var T = Object($.assertDefined(target))
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = $.ES5Object(arguments[i++])
	      , keys   = $.getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	};

/***/ },
/* 147 */
/*!*******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.set-proto.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't works with null proto objects.
	/*eslint-disable no-proto */
	var $      = __webpack_require__(/*! ./$ */ 139)
	  , assert = __webpack_require__(/*! ./$.assert */ 155);
	module.exports = Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	  ? function(buggy, set){
	      try {
	        set = __webpack_require__(/*! ./$.ctx */ 150)(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
	        set({}, []);
	      } catch(e){ buggy = true; }
	      return function(O, proto){
	        assert.obj(O);
	        assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }()
	  : undefined);

/***/ },
/* 148 */
/*!*******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.string-at.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// true  -> String#at
	// false -> String#codePointAt
	var $ = __webpack_require__(/*! ./$ */ 139);
	module.exports = function(TO_STRING){
	  return function(pos){
	    var s = String($.assertDefined(this))
	      , i = $.toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 149 */
/*!**************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.iter.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $                 = __webpack_require__(/*! ./$ */ 139)
	  , ctx               = __webpack_require__(/*! ./$.ctx */ 150)
	  , cof               = __webpack_require__(/*! ./$.cof */ 141)
	  , $def              = __webpack_require__(/*! ./$.def */ 143)
	  , assertObject      = __webpack_require__(/*! ./$.assert */ 155).obj
	  , SYMBOL_ITERATOR   = __webpack_require__(/*! ./$.wks */ 145)('iterator')
	  , FF_ITERATOR       = '@@iterator'
	  , Iterators         = {}
	  , IteratorPrototype = {};
	// Safari has byggy iterators w/o `next`
	var BUGGY = 'keys' in [] && !('next' in [].keys());
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	setIterator(IteratorPrototype, $.that);
	function setIterator(O, value){
	  $.hide(O, SYMBOL_ITERATOR, value);
	  // Add iterator for FF iterator protocol
	  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
	}
	function defineIterator(Constructor, NAME, value, DEFAULT){
	  var proto = Constructor.prototype
	    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
	  // Define iterator
	  if($.FW)setIterator(proto, iter);
	  if(iter !== value){
	    var iterProto = $.getProto(iter.call(new Constructor));
	    // Set @@toStringTag to native iterators
	    cof.set(iterProto, NAME + ' Iterator', true);
	    // FF fix
	    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
	  }
	  // Plug for library
	  Iterators[NAME] = iter;
	  // FF & v8 fix
	  Iterators[NAME + ' Iterator'] = $.that;
	  return iter;
	}
	function getIterator(it){
	  var Symbol  = $.g.Symbol
	    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
	    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
	  return assertObject(getIter.call(it));
	}
	function closeIterator(iterator){
	  var ret = iterator['return'];
	  if(ret !== undefined)assertObject(ret.call(iterator));
	}
	function stepCall(iterator, fn, value, entries){
	  try {
	    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
	  } catch(e){
	    closeIterator(iterator);
	    throw e;
	  }
	}
	var DANGER_CLOSING = true;
	!function(){
	  try {
	    var iter = [1].keys();
	    iter['return'] = function(){ DANGER_CLOSING = false; };
	    Array.from(iter, function(){ throw 2; });
	  } catch(e){ /* empty */ }
	}();
	var $iter = module.exports = {
	  BUGGY: BUGGY,
	  DANGER_CLOSING: DANGER_CLOSING,
	  fail: function(exec){
	    var fail = true;
	    try {
	      var arr  = [[{}, 1]]
	        , iter = arr[SYMBOL_ITERATOR]()
	        , next = iter.next;
	      iter.next = function(){
	        fail = false;
	        return next.call(this);
	      };
	      arr[SYMBOL_ITERATOR] = function(){
	        return iter;
	      };
	      exec(arr);
	    } catch(e){ /* empty */ }
	    return fail;
	  },
	  Iterators: Iterators,
	  prototype: IteratorPrototype,
	  step: function(done, value){
	    return {value: value, done: !!done};
	  },
	  stepCall: stepCall,
	  close: closeIterator,
	  is: function(it){
	    var O      = Object(it)
	      , Symbol = $.g.Symbol
	      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
	    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
	  },
	  get: getIterator,
	  set: setIterator,
	  create: function(Constructor, NAME, next, proto){
	    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
	    cof.set(Constructor, NAME + ' Iterator');
	  },
	  define: defineIterator,
	  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	    function createIter(kind){
	      return function(){
	        return new Constructor(this, kind);
	      };
	    }
	    $iter.create(Constructor, NAME, next);
	    var entries = createIter('key+value')
	      , values  = createIter('value')
	      , proto   = Base.prototype
	      , methods, key;
	    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
	    else entries = defineIterator(Base, NAME, entries, 'entries');
	    if(DEFAULT){
	      methods = {
	        entries: entries,
	        keys:    IS_SET ? values : createIter('key'),
	        values:  values
	      };
	      $def($def.P + $def.F * BUGGY, NAME, methods);
	      if(FORCE)for(key in methods){
	        if(!(key in proto))$.hide(proto, key, methods[key]);
	      }
	    }
	  },
	  forOf: function(iterable, entries, fn, that){
	    var iterator = getIterator(iterable)
	      , f = ctx(fn, that, entries ? 2 : 1)
	      , step;
	    while(!(step = iterator.next()).done){
	      if(stepCall(iterator, f, step.value, entries) === false){
	        return closeIterator(iterator);
	      }
	    }
	  }
	};

/***/ },
/* 150 */
/*!*************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.ctx.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Optional / simple context binding
	var assertFunction = __webpack_require__(/*! ./$.assert */ 155).fn;
	module.exports = function(fn, that, length){
	  assertFunction(fn);
	  if(~length && that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	    };
	};

/***/ },
/* 151 */
/*!*****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.unscope.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	// 22.1.3.31 Array.prototype[@@unscopables]
	var $           = __webpack_require__(/*! ./$ */ 139)
	  , UNSCOPABLES = __webpack_require__(/*! ./$.wks */ 145)('unscopables');
	if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
	module.exports = function(key){
	  if($.FW)[][UNSCOPABLES][key] = true;
	};

/***/ },
/* 152 */
/*!*****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.species.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 139);
	module.exports = function(C){
	  if($.DESC && $.FW)$.setDesc(C, __webpack_require__(/*! ./$.wks */ 145)('species'), {
	    configurable: true,
	    get: $.that
	  });
	};

/***/ },
/* 153 */
/*!***********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.array-methods.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var $   = __webpack_require__(/*! ./$ */ 139)
	  , ctx = __webpack_require__(/*! ./$.ctx */ 150);
	module.exports = function(TYPE){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
	  return function(callbackfn/*, that = undefined */){
	    var O      = Object($.assertDefined(this))
	      , self   = $.ES5Object(O)
	      , f      = ctx(callbackfn, arguments[1], 3)
	      , length = $.toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 154 */
/*!******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.replacer.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = function(regExp, replace, isStatic){
	  var replacer = replace === Object(replace) ? function(part){
	    return replace[part];
	  } : replace;
	  return function(it){
	    return String(isStatic ? it : this).replace(regExp, replacer);
	  };
	};

/***/ },
/* 155 */
/*!****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.assert.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(/*! ./$ */ 139);
	function assert(condition, msg1, msg2){
	  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
	}
	assert.def = $.assertDefined;
	assert.fn = function(it){
	  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
	  return it;
	};
	assert.obj = function(it){
	  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};
	assert.inst = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};
	module.exports = assert;

/***/ },
/* 156 */
/*!**************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.task.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 139)
	  , ctx    = __webpack_require__(/*! ./$.ctx */ 150)
	  , cof    = __webpack_require__(/*! ./$.cof */ 141)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 162)
	  , global             = $.g
	  , isFunction         = $.isFunction
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , postMessage        = global.postMessage
	  , addEventListener   = global.addEventListener
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	function run(){
	  var id = +this;
	  if($.has(queue, id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	}
	function listner(event){
	  run.call(event.data);
	}
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!isFunction(setTask) || !isFunction(clearTask)){
	  setTask = function(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(isFunction(fn) ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(cof(global.process) == 'process'){
	    defer = function(id){
	      global.process.nextTick(ctx(run, id, 1));
	    };
	  // Modern browsers, skip implementation for WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is object
	  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
	    defer = function(id){
	      postMessage(id, '*');
	    };
	    addEventListener('message', listner, false);
	  // WebWorkers
	  } else if(isFunction(MessageChannel)){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // IE8-
	  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
	    defer = function(id){
	      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
	        $.html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 157 */
/*!***************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.collection-strong.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $        = __webpack_require__(/*! ./$ */ 139)
	  , ctx      = __webpack_require__(/*! ./$.ctx */ 150)
	  , safe     = __webpack_require__(/*! ./$.uid */ 142).safe
	  , assert   = __webpack_require__(/*! ./$.assert */ 155)
	  , $iter    = __webpack_require__(/*! ./$.iter */ 149)
	  , has      = $.has
	  , set      = $.set
	  , isObject = $.isObject
	  , hide     = $.hide
	  , step     = $iter.step
	  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
	  , ID       = safe('id')
	  , O1       = safe('O1')
	  , LAST     = safe('last')
	  , FIRST    = safe('first')
	  , ITER     = safe('iter')
	  , SIZE     = $.DESC ? safe('size') : 'size'
	  , id       = 0;
	
	function fastKey(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
	  // can't set id to frozen object
	  if(isFrozen(it))return 'F';
	  if(!has(it, ID)){
	    // not necessary to add id
	    if(!create)return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	  // return object id with prefix
	  } return 'O' + it[ID];
	}
	
	function getEntry(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index != 'F')return that[O1][index];
	  // frozen object case
	  for(entry = that[FIRST]; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      var that = assert.inst(this, C, NAME);
	      set(that, O1, $.create(null));
	      set(that, SIZE, 0);
	      set(that, LAST, undefined);
	      set(that, FIRST, undefined);
	      if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	    }
	    $.mix(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function(){
	        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that[FIRST] = that[LAST] = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that[O1][entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that[FIRST] == entry)that[FIRST] = next;
	          if(that[LAST] == entry)that[LAST] = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function(callbackfn /*, that = undefined */){
	        var f = ctx(callbackfn, arguments[1], 3)
	          , entry;
	        while(entry = entry ? entry.n : this[FIRST]){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if($.DESC)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return assert.def(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that[LAST] = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that[LAST],          // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that[FIRST])that[FIRST] = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index != 'F')that[O1][index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  getIterConstructor: function(){
	    return function(iterated, kind){
	      set(this, ITER, {o: iterated, k: kind});
	    };
	  },
	  next: function(){
	    var iter  = this[ITER]
	      , kind  = iter.k
	      , entry = iter.l;
	    // revert to the last existing entry
	    while(entry && entry.r)entry = entry.p;
	    // get next entry
	    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
	      // or finish the iteration
	      iter.o = undefined;
	      return step(1);
	    }
	    // return step by kind
	    if(kind == 'key'  )return step(0, entry.k);
	    if(kind == 'value')return step(0, entry.v);
	    return step(0, [entry.k, entry.v]);
	  }
	};

/***/ },
/* 158 */
/*!********************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.collection.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $     = __webpack_require__(/*! ./$ */ 139)
	  , $def  = __webpack_require__(/*! ./$.def */ 143)
	  , $iter = __webpack_require__(/*! ./$.iter */ 149)
	  , assertInstance = __webpack_require__(/*! ./$.assert */ 155).inst;
	
	module.exports = function(NAME, methods, common, IS_MAP, isWeak){
	  var Base  = $.g[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  function fixMethod(KEY, CHAIN){
	    var method = proto[KEY];
	    if($.FW)proto[KEY] = function(a, b){
	      var result = method.call(this, a === 0 ? 0 : a, b);
	      return CHAIN ? this : result;
	    };
	  }
	  if(!$.isFunction(C) || !(isWeak || !$iter.BUGGY && proto.forEach && proto.entries)){
	    // create collection constructor
	    C = common.getConstructor(NAME, IS_MAP, ADDER);
	    $.mix(C.prototype, methods);
	  } else {
	    var inst  = new C
	      , chain = inst[ADDER](isWeak ? {} : -0, 1)
	      , buggyZero;
	    // wrap for init collections from iterable
	    if($iter.fail(function(iter){
	      new C(iter); // eslint-disable-line no-new
	    }) || $iter.DANGER_CLOSING){
	      C = function(iterable){
	        assertInstance(this, C, NAME);
	        var that = new Base;
	        if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
	        return that;
	      };
	      C.prototype = proto;
	      if($.FW)proto.constructor = C;
	    }
	    isWeak || inst.forEach(function(val, key){
	      buggyZero = 1 / key === -Infinity;
	    });
	    // fix converting -0 key to +0
	    if(buggyZero){
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    // + fix .add & .set for chaining
	    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
	  }
	
	  __webpack_require__(/*! ./$.cof */ 141).set(C, NAME);
	  __webpack_require__(/*! ./$.species */ 152)(C);
	
	  O[NAME] = C;
	  $def($def.G + $def.W + $def.F * (C != Base), O);
	
	  // add .keys, .values, .entries, [@@iterator]
	  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	  if(!isWeak)$iter.std(
	    C, NAME,
	    common.getIterConstructor(), common.next,
	    IS_MAP ? 'key+value' : 'value' , !IS_MAP, true
	  );
	
	  return C;
	};

/***/ },
/* 159 */
/*!*************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.collection-weak.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $         = __webpack_require__(/*! ./$ */ 139)
	  , safe      = __webpack_require__(/*! ./$.uid */ 142).safe
	  , assert    = __webpack_require__(/*! ./$.assert */ 155)
	  , forOf     = __webpack_require__(/*! ./$.iter */ 149).forOf
	  , has       = $.has
	  , isObject  = $.isObject
	  , hide      = $.hide
	  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
	  , id        = 0
	  , ID        = safe('id')
	  , WEAK      = safe('weak')
	  , LEAK      = safe('leak')
	  , method    = __webpack_require__(/*! ./$.array-methods */ 153)
	  , find      = method(5)
	  , findIndex = method(6);
	function findFrozen(store, key){
	  return find.call(store.array, function(it){
	    return it[0] === key;
	  });
	}
	// fallback for frozen keys
	function leakStore(that){
	  return that[LEAK] || hide(that, LEAK, {
	    array: [],
	    get: function(key){
	      var entry = findFrozen(this, key);
	      if(entry)return entry[1];
	    },
	    has: function(key){
	      return !!findFrozen(this, key);
	    },
	    set: function(key, value){
	      var entry = findFrozen(this, key);
	      if(entry)entry[1] = value;
	      else this.array.push([key, value]);
	    },
	    'delete': function(key){
	      var index = findIndex.call(this.array, function(it){
	        return it[0] === key;
	      });
	      if(~index)this.array.splice(index, 1);
	      return !!~index;
	    }
	  })[LEAK];
	}
	
	module.exports = {
	  getConstructor: function(NAME, IS_MAP, ADDER){
	    function C(iterable){
	      $.set(assert.inst(this, C, NAME), ID, id++);
	      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
	    }
	    $.mix(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this)['delete'](key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function(key){
	        if(!isObject(key))return false;
	        if(isFrozen(key))return leakStore(this).has(key);
	        return has(key, WEAK) && has(key[WEAK], this[ID]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    if(isFrozen(assert.obj(key))){
	      leakStore(that).set(key, value);
	    } else {
	      has(key, WEAK) || hide(key, WEAK, {});
	      key[WEAK][that[ID]] = value;
	    } return that;
	  },
	  leakStore: leakStore,
	  WEAK: WEAK,
	  ID: ID
	};

/***/ },
/* 160 */
/*!******************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.own-keys.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	var $            = __webpack_require__(/*! ./$ */ 139)
	  , assertObject = __webpack_require__(/*! ./$.assert */ 155).obj;
	module.exports = function(it){
	  assertObject(it);
	  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
	};

/***/ },
/* 161 */
/*!************************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.array-includes.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// false -> Array#indexOf
	// true  -> Array#includes
	var $ = __webpack_require__(/*! ./$ */ 139);
	module.exports = function(IS_INCLUDES){
	  return function(el /*, fromIndex = 0 */){
	    var O      = $.toObject(this)
	      , length = $.toLength(O.length)
	      , index  = $.toIndex(arguments[1], length)
	      , value;
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 162 */
/*!****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.invoke.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	// Fast apply
	// http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
	                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 163 */
/*!*****************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.partial.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $      = __webpack_require__(/*! ./$ */ 139)
	  , invoke = __webpack_require__(/*! ./$.invoke */ 162)
	  , assertFunction = __webpack_require__(/*! ./$.assert */ 155).fn;
	module.exports = function(/* ...pargs */){
	  var fn     = assertFunction(this)
	    , length = arguments.length
	    , pargs  = Array(length)
	    , i      = 0
	    , _      = $.path._
	    , holder = false;
	  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
	  return function(/* ...args */){
	    var that    = this
	      , _length = arguments.length
	      , j = 0, k = 0, args;
	    if(!holder && !_length)return invoke(fn, pargs, that);
	    args = pargs.slice();
	    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
	    while(_length > k)args.push(arguments[k++]);
	    return invoke(fn, args, that);
	  };
	};

/***/ },
/* 164 */
/*!************************************************!*\
  !*** ./~/babel-core/~/core-js/modules/$.fw.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = function($){
	  $.FW   = true;
	  $.path = $.g;
	  return $;
	};

/***/ }
/******/ ]);
//# sourceMappingURL=4-obj-reader.js.map