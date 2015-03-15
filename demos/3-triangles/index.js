(function (root) {
  'use strict';

  const canvas = document.querySelector('canvas');
  const resize = WebGLUtils.genResizeFun(canvas);
  const VERTEX_SIZE = 3;

  let gl = WebGLUtils.setupWebGL(canvas);
  let angle = 30.0;

  if (!gl)
    throw new Error('Couldn\'t retrieve webgl context.');

  if (!Shaders.initFromElems(gl,
                             document.getElementById('vshader'),
                             document.getElementById('fshader'))) {
    throw new Error('Failed to initialize shaders');
  }

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
  function initVertexBuffers (gl) {
    const VERTICES = [
      -0.5, 0.5, .0,
      -0.5, -0.5, .0,
      0.5, 0.5, .0,
      0.5, -0.5, .0,
    ];

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer)
      throw new Error('Failed to create buffer');

    // binding to a target tells webgl the type of
    // data that the buffer contains.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);

    // assign the buffer object to a_Position
    // variable. It assigns an array of values to
    // an attribute values. Although we don't
    // explicity pass the buffer object, this will
    // assign implicitly the buffer object bound
    // to gl.ARRAY_BUFFER.
    gl.vertexAttribPointer(a_Position, VERTEX_SIZE, gl.FLOAT, false, 0, 0);
    // enable the assignment to a_Position
    gl.enableVertexAttribArray(a_Position);

    // now that is enabled we CAN'T use
    // gl.vertexAttrib to assign data to
    // attribute. We must firstly disable what
    // we've done.

    return VERTICES.length/VERTEX_SIZE;
  }

  let [a_Position, u_FragColor, u_xformMatrix] =
      Shaders.getAttribs(gl, 'a_Position', 'u_FragColor', 'u_xformMatrix');
  const N_VERTICES = initVertexBuffers(gl);

  let radian = Math.PI * angle/180.0;
  let cosB = Math.cos(radian);
  let sinB = Math.sin(radian);
  let xformMatrix = new Float32Array([
    cosB, sinB, .0, .0,
    -sinB, cosB, .0, .0,
    .0, .0, 1., .0,
    .0, .0, .0, 1.,
  ]);

  console.log(xformMatrix);


  function render () {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    // N_VERTICES tells how many times the vertex
    // shader needs to be executed for drawing
    // something.
    gl.uniform4fv(u_FragColor, new Float32Array([1.0,0.0,0.0,1.0]));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_VERTICES);

    // gl.uniform4fv(u_FragColor, new Float32Array([0.0,1.0,0.0,1.0]));
    // gl.drawArrays(gl.LINE_STRIP, 0, N_VERTICES);

    // gl.uniform4fv(u_FragColor, new Float32Array([1.0,1.0,1.0,1.0]));
    // gl.drawArrays(gl.POINTS, 0, N_VERTICES);
  }

  resize();
  root.addEventListener('resize', resize);

  (function loop () {
    root.requestAnimationFrame(loop);
    render();
  })();
})(window);
