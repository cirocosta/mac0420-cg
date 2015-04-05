(function (root, document) {
  'use strict';

  const deg_to_rad = (deg) => deg*Math.PI/180.0;
  const canvas = document.querySelector('canvas');
  let gl = WebGLUtils.setupWebGL(canvas);

  Shaders.initFromElems(gl, document.getElementById('vshader'),
                            document.getElementById('fshader'))

  let M = mat4.create();    // model
  let N = mat4.create();    // normal
  let V = mat4.create();    // view
  let P = mat4.create();    // perspective
  let VM = mat4.create();   // model-view
  let PVM = mat4.create();  // model-view-perspective

  mat4.translate(M, M, [0.0, 1.0, 0.0]);
  mat4.rotate(M, M, deg_to_rad(90.0), [0.0, 0.0, 1.0]);

  mat4.perspective(P, deg_to_rad(30), 1, 1, 100);
  mat4.lookAt(V, [-7.0,  2.5,  6.0],
                 [ 0.0,  0.0,  0.0],
                 [ 0.0,  1.0,  0.0]);
  mat4.multiply(VM, V, M);
  mat4.multiply(PVM, P, VM);
  mat4.invert(N, M);
  mat4.transpose(N, N);

  const LOCATIONS = Shaders.getLocations(gl,
    ['a_Position', 'a_Color', 'a_Normal',
     'u_NormalMatrix', 'u_MvpMatrix', 'u_ModelMatrix',
     'u_LightColor', 'u_AmbientLight', 'u_LightPosition'
    ]);


  gl.uniform3f(LOCATIONS.u_LightColor, 1.0, 1.0, 1.0);
  gl.uniform3f(LOCATIONS.u_AmbientLight, 0.2, 0.2, 0.2);
  gl.uniform3f(LOCATIONS.u_LightPosition, 2.3, 4.0, 3.5);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv(LOCATIONS.u_ModelMatrix, false, M);
  gl.uniformMatrix4fv(LOCATIONS.u_NormalMatrix, false, N);
  gl.uniformMatrix4fv(LOCATIONS.u_MvpMatrix, false, PVM);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // drawColorCube(gl, LOCATIONS);
  drawColorFacesCube(gl, LOCATIONS);

  function drawColorFacesCube (gl, locations) {
    const VERTICES = new Float32Array([   // Vertex coordinates
       1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
       1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
       1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
       1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const COLORS = new Float32Array([     // Colors
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v1-v2-v3 front(blue)
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v3-v4-v5 right(green)
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v0-v5-v6-v1 up(red)
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  // v7-v4-v3-v2 down
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0   // v4-v7-v6-v5 back
    ]);

    const NORMALS = new Float32Array([    // Normal
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    const INDICES = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);

    // Create a buffer object
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer)
      throw new Error('Error while creating buffer');

    // Write the vertex coordinates and color to the buffer object
    WebGLUtils.initBuffer(gl, NORMALS, 3, gl.FLOAT,
                               locations.a_Normal);
    WebGLUtils.initBuffer(gl, VERTICES, 3, gl.FLOAT,
                               locations.a_Position);
    WebGLUtils.initBuffer(gl, COLORS, 3, gl.FLOAT,
                               locations.a_Color);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_BYTE, 0);
  }

  function drawColorCube (gl, locations) {
    // 8 vertices that denotes what a cube is.
    const VERTICES = new Float32Array([
       1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
      -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
      -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
       1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
       1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
       1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
      -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
      -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);

    // indices to be used internally for creating
    // the triangles that represents the cube
    // (each face contains 6 vertices from 3
    // triangles).
    const INDICES = new Uint16Array([
      0, 1, 2,   0, 2, 3,    // front
      0, 3, 4,   0, 4, 5,    // right
      0, 5, 6,   0, 6, 1,    // up
      1, 6, 7,   1, 7, 2,    // left
      7, 4, 3,   7, 3, 2,    // down
      4, 7, 6,   4, 6, 5     // back
    ]);


    const vertexAndColorBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    if (!(vertexAndColorBuffer && indexBuffer))
      throw new Error('failed to create buffer');

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexAndColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

    // getting the float size.
    const TRIANGLE_VSIZE = 3;
    const COLOR_VSIZE = 3;
    const FSIZE = VERTICES.BYTES_PER_ELEMENT;
    const STRIDE = FSIZE * (TRIANGLE_VSIZE + COLOR_VSIZE);
    const OFFSET_COLOR = FSIZE * TRIANGLE_VSIZE;
    const OFFSET_QUAD = 0;

    // a_Position
    gl.vertexAttribPointer(locations.a_Position, TRIANGLE_VSIZE, gl.FLOAT, false,
                           STRIDE, OFFSET_QUAD);
    gl.enableVertexAttribArray(locations.a_Position);

    // a_Color
    gl.vertexAttribPointer(locations.a_Color, COLOR_VSIZE, gl.FLOAT, false,
                           STRIDE, OFFSET_COLOR);
    gl.enableVertexAttribArray(locations.a_Color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_SHORT, 0);
  }
})(window, document);
