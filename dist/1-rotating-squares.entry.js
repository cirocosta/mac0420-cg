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
/*!*******************************************!*\
  !*** ./demos/1-rotating-squares/index.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	(function (window, document) {
	  'use strict';
	
	  var canvas = document.querySelector('canvas');
	  var gl = WebGLUtils.setupWebGL(canvas);
	
	  var theta = 0;
	  var VERTICES_1 = [0, 0.5, 0.5, 0, -0.5, 0, 0, -0.5];
	  var TRANSLATION_1 = -0.3;
	
	  var VERTICES_2 = [0, 0.5, 0.5, 0, -0.5, 0, 0, -0.5];
	  var TRANSLATION_2 = 0.3;
	
	  // specifies the affine transformation of x and
	  // y from normalized device coordinates to
	  // window coordinates.
	  gl.viewport(0, 0, canvas.width, canvas.height);
	  // specifying the clear color for a drawing area
	  gl.clearColor(0, 0, 0, 1);
	
	  if (!Shaders.initFromElems(gl, document.getElementById('vshader'), document.getElementById('fshader'))) {
	    throw new Error('Failed to initialize shaders');
	  }
	
	  var bufferId = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	
	  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Position);
	
	  var a_Translation = gl.getAttribLocation(gl.program, 'a_Translation');
	  if (! ~a_Translation) throw new Error('Couldn\'t retrieve a_Translation attrib.');
	
	  var u_theta = gl.getUniformLocation(gl.program, 'u_theta');
	  if (! ~u_theta) throw new Error('Couldn\'t retrieve a_Translation attrib.');
	
	  function render() {
	    // non-specific preparation
	    gl.clear(gl.COLOR_BUFFER_BIT);
	    theta += 0.1;
	    gl.uniform1f(u_theta, theta);
	
	    // first rectangle
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES_1), gl.STATIC_DRAW);
	    gl.vertexAttrib1f(a_Translation, TRANSLATION_1);
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
	    // second rectangle
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES_2), gl.STATIC_DRAW);
	    gl.vertexAttrib1f(a_Translation, TRANSLATION_2);
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	  }
	
	  (function loop() {
	    window.requestAnimationFrame(loop);
	    render();
	  })();
	})(window, document);

/***/ }
/******/ ]);
//# sourceMappingURL=1-rotating-squares.entry.js.map