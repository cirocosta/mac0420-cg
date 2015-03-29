(function (root, document) {
  'use strict';

  const canvas = document.querySelector('canvas');

  let gl = WebGLUtils.setupWebGL(canvas);
  let angle = 30.0;
  let eye_x = .0, eye_y = .0, eye_z = .2;
  let near = .0, far = 2.0;

  const QUAD_VERTEX_SIZE = 3;
  const N_VERTICES = 3 * 3;
  const resize = WebGLUtils.genResizeFun(canvas, gl);

  Shaders.initFromElems(gl, document.getElementById('vshader'),
                            document.getElementById('fshader'))

  let modelMatrix = MV.mat4.identity();;
  let projMatrix = new Matrix4();
  let viewMatrix = new Matrix4();

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
  function initVertexBuffers (gl, locations) {
    const VERTICES = new Float32Array([
      //    x ,   y ,  z,       R,   G,   B
           0.0, 0.5 ,  -0.4,  1.0, 0.0, 0.0,
          -0.5, -0.5,  -0.4,  0.0, 1.0, 0.0,
           0.5, -0.5,  -0.4,  0.0, 1.0, 0.0,

          -0.5, 0.5,  -0.2,  1.0, 0.0, 1.0,
           0.0, -0.5 ,  -0.2,  0.0, 0.0, 1.0,
          0.5, 0.5 ,  -0.2,  0.0, 1.0, 0.0,

          0.0, 0.5  ,  -0.0,  0.0, 1.0, 0.0,
          -0.5, -0.5,  -0.0,  1.0, 0.0, 1.0,
          0.5, -0.5 , -0.0,  0.0, 0.0, 1.0,
    ]);
    const FSIZE = VERTICES.BYTES_PER_ELEMENT;
    const STRIDE = FSIZE * (QUAD_VERTEX_SIZE + 3);
    const OFFSET_COLOR = FSIZE * QUAD_VERTEX_SIZE;
    const OFFSET_QUAD = 0;

    const vertexBuffer = gl.createBuffer();

    if (!vertexBuffer)
      throw new Error('Failed to create colorBuffer');

    // bindings for a_Position
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

    // a_Position
    gl.vertexAttribPointer(locations.a_Position, QUAD_VERTEX_SIZE, gl.FLOAT, false,
                           STRIDE, OFFSET_QUAD);
    gl.enableVertexAttribArray(locations.a_Position);

    // a_Color
    gl.vertexAttribPointer(locations.a_Color, 3, gl.FLOAT, false,
                           STRIDE, OFFSET_COLOR);
    gl.enableVertexAttribArray(locations.a_Color);
  }

  const LOCATIONS = Shaders.getLocations(gl,
    ['a_Position', 'a_Color', 'u_modelMatrix', 'u_viewMatrix', 'u_projMatrix']);
  initVertexBuffers(gl, LOCATIONS);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  function render () {
    // we always need to finish the transformation
    // matrix by transposing it as opengl operater
    // on column-major order.
    viewMatrix.setLookAt(eye_x, eye_y, eye_z,   // eye points
                         .0, .0, .0,            // at point
                         .0, 1., .0);           // up vector

    projMatrix.setOrtho(-1., 1.,      // left, right
                        -1., 1.,      // bottom, top
                        near, far); // near, far

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(LOCATIONS.u_projMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(LOCATIONS.u_viewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(LOCATIONS.u_modelMatrix, false, modelMatrix);

    // N_VERTICES tells how many times the vertex
    // shader needs to be executed for drawing
    // something.
    gl.drawArrays(gl.TRIANGLES, 0, N_VERTICES);
  }

  resize();
  root.addEventListener('resize', resize);
  document.addEventListener('keydown', (ev) => {
    console.log("eye (x,y,z)", eye_x, eye_y, eye_z);
    console.log("near, far: ", near, far);

    switch (ev.key) {
      case 'ArrowRight':
        near += .01;
        break;
      case 'ArrowLeft':
        near -= .01;
        break;
      case 'ArrowUp':
        far += .01;
        break;
      case 'ArrowDown':
        far -= .01;
        break;
      case 'a':
        eye_x -= .01;
        break;
      case 'd':
        eye_x += .01;
        break;
      case 'w':
        eye_z -= .01;
        break;
      case 's':
        eye_z += .01;
        break;
      default:
        return;
    }
  });

  (function loop () {
    root.requestAnimationFrame(loop);
    render();
  })();
})(window, document);
