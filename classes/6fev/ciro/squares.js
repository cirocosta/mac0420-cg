(function (window) {
  'use strict';

  let canvas = document.querySelector('canvas');
  let gl = WebGLUtils.setupWebGL(canvas);

  if (!gl)
    throw new Error('GL instance couldn\'t be set.');

  const vertices = [
    MV.vec2(-.5, -.5),
    MV.vec2(-.5, .5),
    MV.vec2(.5, .5),
    MV.vec2(.5, -.5),
  ];

  // specifies the affine transformation of x and
  // y from normalized device coordinates to
  // window coordinates.
  gl.viewport(0, 0, canvas.width, canvas.height);
  // specifying the clear color for a drawing area
  gl.clearColor(.0, .0, .0, 1.);


  window.requestAnimationFrame((ms) => {
    render();
  });

  function render () {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
})(window);
