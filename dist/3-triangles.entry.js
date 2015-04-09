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
/*!************************************!*\
  !*** ./demos/3-triangles/index.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	(function (root) {
	  'use strict';
	
	  var deg_to_rad = function deg_to_rad(deg) {
	    return deg * Math.PI / 180;
	  };
	  var canvas = document.querySelector('canvas');
	
	  var gl = WebGLUtils.setupWebGL(canvas);
	  var angle = 30;
	
	  var M = mat4.create();
	
	  var QUAD_VERTEX_SIZE = 3;
	  var resize = WebGLUtils.genResizeFun(canvas, gl);
	
	  Shaders.initFromElems(gl, document.getElementById('vshader'), document.getElementById('fshader'));
	
	  /**
	   * A benefit that comes from using buffers is
	   * that the vertex shader is then able to
	   * access more than one vertice per time.
	   *
	   * 1. create a buffer object
	   * 2. bind the buffer to a target
	   * 3. write data into the buffer
	   * 4. assign the buffer to an attribute variable
	   * 5. enable the assignment
	   */
	  function initVertexBuffers(gl, locations) {
	    var VERTICES = new Float32Array([
	    //    x ,   y ,  z, PointSize , R, G, B
	    -0.5, 0.5, 0, 20, 1, 0, 0, -0.5, -0.5, 0, 30, 0, 1, 0, 0.5, 0.5, 0, 40, 0, 0, 1, 0.5, -0.5, 0, 50, 1, 1, 1]);
	    var FSIZE = VERTICES.BYTES_PER_ELEMENT;
	    var STRIDE = FSIZE * (QUAD_VERTEX_SIZE + 1 + 3);
	    var OFFSET_POINT = FSIZE * QUAD_VERTEX_SIZE;
	    var OFFSET_COLOR = FSIZE * (QUAD_VERTEX_SIZE + 1);
	    var OFFSET_QUAD = 0;
	
	    var vertexBuffer = gl.createBuffer();
	
	    if (!vertexBuffer) throw new Error('Failed to create colorBuffer');
	
	    // bindings for a_Position
	    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
	    gl.vertexAttribPointer(locations.a_Position, QUAD_VERTEX_SIZE, gl.FLOAT, false, STRIDE, OFFSET_QUAD);
	    gl.enableVertexAttribArray(locations.a_Position);
	
	    // a_PointSize
	    gl.vertexAttribPointer(locations.a_PointSize, 1, gl.FLOAT, false, STRIDE, OFFSET_POINT);
	    gl.enableVertexAttribArray(locations.a_PointSize);
	
	    // a_Color
	    gl.vertexAttribPointer(locations.a_Color, 3, gl.FLOAT, false, STRIDE, OFFSET_COLOR);
	    gl.enableVertexAttribArray(locations.a_Color);
	
	    // now that is enabled we CAN'T use
	    // gl.vertexAttrib to assign data to
	    // attribute. We must firstly disable what
	    // we've done.
	
	    return 4;
	  }
	
	  var LOCATIONS = Shaders.getLocations(gl, ['a_Position', 'a_PointSize', 'a_Color', 'u_xformMatrix']);
	  var N_VERTICES = initVertexBuffers(gl, LOCATIONS);
	
	  gl.clearColor(0, 0, 0, 1);
	
	  function render() {
	    angle += 1;
	
	    // we always need to finish the transformation
	    // matrix by transposing it as opengl operater
	    // on column-major order.
	    mat4.identity(M);
	    mat4.rotateZ(M, M, deg_to_rad(angle));
	
	    gl.clear(gl.COLOR_BUFFER_BIT);
	    gl.uniformMatrix4fv(LOCATIONS.u_xformMatrix, false, M);
	
	    // N_VERTICES tells how many times the vertex
	    // shader needs to be executed for drawing
	    // something.
	    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_VERTICES);
	    gl.drawArrays(gl.POINTS, 0, N_VERTICES);
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
//# sourceMappingURL=3-triangles.entry.js.map