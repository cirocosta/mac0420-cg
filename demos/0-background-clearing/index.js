'use strict';

/**
 * Basic flow of a webgl program:
 *
 * 1. retrieve the <canvas> element
 * 2. get the rendering context for webgl
 * 3. initialize shaders
 * 4. set the color for clearing <canvas>
 * 5. clear <canvas>
 * 6. draw te representation of our objects
 */

import '../../assets/webgl-debug';
import WebGLUtils from '../../assets/webgl-utils';

let g_points = [[0.0, 0.0]];
let g_colors = [[1.0, 0.0, 0.0, 1.0]];
let canvas = document.querySelector('canvas');
let gl = WebGLUtils.setupWebGL(canvas);

const resize = WebGLUtils.genResizeFun(canvas, gl);

// per-vertex operations. This one will pass
// gl_Position and gl_PointSize to the fshader
// (actually, the fragments processed).
// gl_Position MUST always be written.
// gl_PointSize only when drawing points.
const VSHADER_SOURCE = [
// using right-handed coordinate system
  'attribute vec4 a_Position;',
  'attribute float a_PointSize;',
  'void main () {',
  // attribute to be passed to the shader
  // the '1.0' assigned to the fourth place of
  // vec4 is called the 'homogeneous
  // coordinate'. (x,y,z,w) ==> (x/w,y/w,z/y).
  '  gl_Position = a_Position;', // coordinates
  '  gl_PointSize = a_PointSize;', // point size
  '}'
].join('\n');

// per-fragment operations
const FSHADER_SOURCE = [
  'precision mediump float;',
  'uniform vec4 u_FragColor;',
  'void main () {',
  '  gl_FragColor = u_FragColor;',
  '}',
].join('\n');

if (!WebGLUtils.Shaders.initFromSrc(gl, VSHADER_SOURCE, FSHADER_SOURCE))
  throw new Error('Failed to initialize shaders');

const LOCATIONS = WebGLUtils.Shaders.getLocations(gl, [
  'a_Position', 'a_PointSize', 'u_FragColor'
]);

// setting vertex attributes
gl.vertexAttrib1f(LOCATIONS.a_PointSize, 20.0);

canvas.addEventListener('mousedown', (ev) => {
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  // converting from canvas coordinates to webgl
  // right-handed coordinates
  x = ((x - rect.left) - canvas.height/2) / (canvas.height/2);
  y = (canvas.width/2 - (y - rect.top)) / (canvas.width/2);

  // adds the point to the global g_points
  // coordinates store.
  g_colors.push([Math.random(), Math.random(), Math.random(), 1.0]);
  g_points.push([x, y]);
});

/**
 * Draws something into screen
 */
function render () {
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i in g_points) {
    gl.uniform4fv(LOCATIONS.u_FragColor, new Float32Array(g_colors[i]));
    gl.vertexAttrib3f(LOCATIONS.a_Position, g_points[i][0], g_points[i][1], 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

window.addEventListener('resize', resize);
resize(canvas);

(function loop () {
  window.requestAnimationFrame(loop);
  render();
})();
