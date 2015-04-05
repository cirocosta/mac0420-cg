(function (window, document) {
  'use strict';

  let canvas = document.querySelector('canvas');
  let gl = WebGLUtils.setupWebGL(canvas);

  let theta = 0.0;
  const VERTICES_1 = [
    0.0, 0.5,
    0.5, 0.0,
    -0.5, 0.0,
    0.0, -0.5
  ];
  const TRANSLATION_1 = -.3;

  const VERTICES_2 = [
    0.0, 0.5,
    0.5, 0.0,
    -0.5, 0.0,
    0.0, -0.5
  ];
  const TRANSLATION_2 = .3;

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

  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  let a_Translation = gl.getAttribLocation(gl.program, 'a_Translation');
  if (!~a_Translation)
    throw new Error('Couldn\'t retrieve a_Translation attrib.');

  let u_theta = gl.getUniformLocation(gl.program, 'u_theta');
  if (!~u_theta)
    throw new Error('Couldn\'t retrieve a_Translation attrib.');

  function render () {
    // non-specific preparation
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.1;
    gl.uniform1f(u_theta, theta);

    // first rectangle
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten32f(VERTICES_1), gl.STATIC_DRAW);
    gl.vertexAttrib1f(a_Translation, TRANSLATION_1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // second rectangle
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten32f(VERTICES_2), gl.STATIC_DRAW);
    gl.vertexAttrib1f(a_Translation, TRANSLATION_2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  (function loop () {
    window.requestAnimationFrame(loop);
    render();
  })();
})(window, document);
