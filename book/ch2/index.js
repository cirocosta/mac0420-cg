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


(function (window) {
  'use strict';
  let g_points = [0.0, 0.0];

  let canvas = document.querySelector('canvas');
  let gl = WebGLUtils.setupWebGL(canvas);

  if (!gl)
    throw new Error('Couldn\'t retrieve webgl context.');

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
    'void main () {',
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);', // color
    '}'
  ].join('\n');

  if (!Shaders.initFromSrc(gl, VSHADER_SOURCE, FSHADER_SOURCE))
    throw new Error('Failed to initialize shaders');

  // try to get a reference to shader attributes
  // TODO add a routine that does this for various
  // attributes taking benefit of array
  // destructuring
  let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if (!~a_PointSize)
    throw new Error('Failed to get the storage location of a_Position');

  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (!~a_Position)
    throw new Error('Failed to get the storage location of a_Position');



  // setting vertex attributes
  gl.vertexAttrib1f(a_PointSize, 20.0);
  // gl.vertexAttrib4fv(a_Position, new Float32Array([0.0, 0.0, 0.0, 1.0]));

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
    g_points.push(x);
    g_points.push(y);
  });

  /**
   * Draws something into screen
   */
  function render () {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0, N = g_points.length; i < N; i += 2) {
      gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  }

  (function loop () {
    window.requestAnimationFrame(loop);
    render();
  })();
})(window);
