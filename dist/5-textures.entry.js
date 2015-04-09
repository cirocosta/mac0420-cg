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
/*!***********************************!*\
  !*** ./demos/5-textures/index.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	(function (root) {
	  'use strict';
	
	  /**
	   * Drawing with textures:
	   *
	   * 1. receive the texture coordinates in the
	   * vertex shader and then passe them to the
	   * fragment shader
	   *
	   * 2. paste the texture image onto the
	   * geometric shape inside the fragment shader
	   *
	   * 3. set the texture coordinates
	   *
	   * 4. prepare the texture image for loading,
	   * and request the browser to read it.
	   *
	   * 5. configure the loaded texture so that it
	   * can be used in webgl.
	   */
	
	  var canvas = document.querySelector('canvas');
	  var gl = WebGLUtils.setupWebGL(canvas);
	  var resize = WebGLUtils.genResizeFun(canvas, gl);
	  var N_VERTICES = 4;
	
	  Shaders.initFromElems(gl, document.getElementById('vshader'), document.getElementById('fshader'));
	
	  function initVertexBuffers(gl, locations) {
	    var VERTICES_AND_TEX = new Float32Array([
	    //    x ,   y ,  tx,  ty
	    -0.5, 0.5, 0, 1, -0.5, -0.5, 0, 0, 0.5, 0.5, 1, 1, 0.5, -0.5, 1, 0]);
	
	    var vertexTexCoordBuffer = gl.createBuffer();
	    var FSIZE = VERTICES_AND_TEX.BYTES_PER_ELEMENT;
	
	    if (!vertexTexCoordBuffer) throw new Error('Failed to create vertexTexCoordBuffer');
	
	    // bindings for a_Position
	    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, VERTICES_AND_TEX, gl.STATIC_DRAW);
	
	    gl.vertexAttribPointer(locations.a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
	    gl.enableVertexAttribArray(locations.a_Position);
	
	    gl.vertexAttribPointer(locations.a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
	    gl.enableVertexAttribArray(locations.a_TexCoord);
	  }
	
	  var LOCATIONS = Shaders.getLocations(gl, ['a_Position', 'a_TexCoord', 'u_Sampler']);
	
	  initVertexBuffers(gl, LOCATIONS);
	  gl.clearColor(0, 0, 0, 1);
	
	  WebGLUtils.initTextures(gl, LOCATIONS.u_Sampler, 'sky.jpg');
	
	  function render() {
	    gl.clear(gl.COLOR_BUFFER_BIT);
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_VERTICES);
	  }
	
	  resize();
	  root.addEventListener('resize', resize);
	
	  (function loop() {
	    root.requestAnimationFrame(loop);
	    render();
	  })();
	})(window);

/***/ }
/******/ ]);
//# sourceMappingURL=5-textures.entry.js.map