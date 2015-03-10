(function (window, document) {
  'use strict';

  let canvas = document.querySelector('canvas');
  let gl = WebGLUtils.setupWebGL(canvas);

  let theta = 0.0;
  const VERTICES = [
    MV.vec2( 0, .5),
    MV.vec2( .5, 0),
    MV.vec2(-.5, 0),
    MV.vec2( 0, -.5)
  ];

  // specifies the affine transformation of x and
  // y from normalized device coordinates to
  // window coordinates.
  gl.viewport(0, 0, canvas.width, canvas.height);
  // specifying the clear color for a drawing area
  gl.clearColor(.0, .0, .0, 1.);

  if (!Shaders.initFromElems(gl,
                             document.getElementById('vshader'),
                             document.getElementById('fshader'))) {
    throw new Error('Failed to initialize shaders');
  }

  let bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, MV.flatten32f(VERTICES), gl.STATIC_DRAW);

  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  let u_theta = gl.getUniformLocation(gl.program, 'u_theta');

  function render () {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += 0.1;
    gl.uniform1f(u_theta, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  (function loop () {
    window.requestAnimationFrame(loop);
    render();
  })();
})(window, document);
