(function (window, document) {
  'use strict';

  let _rotating = {
    ROTATE_X: false,
    ROTATE_Y: false,
    ROTATE_Z: false
  };
  let _rotations = {
    ROTATE_X: 0.0,
    ROTATE_Y: 0.0,
    ROTATE_Z: 0.0
  };
  let _looping = false;
  let _pressed = null;

  const ObjParser = window.ObjParser;
  const ELEMS = {
    canvas: document.querySelector('canvas'),

    fileinput: document.querySelector('.fileupload input'),
    filebtn: document.querySelector('.fileupload button'),
    filename: document.querySelector('.fileupload p'),

    vshader: document.getElementById('vshader'),
    fshader: document.getElementById('fshader'),

    rotateX: document.querySelector('.command-rotateX'),
    rotateY: document.querySelector('.command-rotateY'),
    rotateZ: document.querySelector('.command-rotateZ'),
    toggleProjection: document.querySelector('.command-toggleProjection'),
    toggleRotation: document.querySelector('.command-toggleRotation'),
    toggleMeshgrid: document.querySelector('.command-toggleMeshgrid'),
    toggleShading: document.querySelector('.command-toggleShading'),
  };

  function triggerRotation (which, flag) {
    _rotating[which] = flag;
  }

  function incRotation (which) {
    _rotations[which] += 2;
  }

  ELEMS.toggleRotation.addEventListener('click', (ev) => {
    triggerRotation('ROTATE_X', true);
    triggerRotation('ROTATE_Y', true);
    triggerRotation('ROTATE_Z', true);
  });

  ELEMS.rotateX.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_X', true));
  ELEMS.rotateY.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_Y', true));
  ELEMS.rotateZ.addEventListener('mousedown', triggerRotation.bind(null, 'ROTATE_Z', true));

  ELEMS.rotateX.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_X', false));
  ELEMS.rotateY.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_Y', false));
  ELEMS.rotateZ.addEventListener('mouseup', triggerRotation.bind(null, 'ROTATE_Z', false));

  let current_file, obj;
  let VERTICES, INDICES, NORMALS;
  const gl = WebGLUtils.setupWebGL(ELEMS.canvas);

  let modelMatrix = new Matrix4();
  let normalMatrix = new Matrix4();
  let mvpMatrix = new Matrix4();
  var viewProjMatrix = new Matrix4();

  const resize = WebGLUtils.genResizeFun(ELEMS.canvas, gl, (w, h, shouldDraw) => {
    viewProjMatrix.setPerspective(30.0, w/h, 0.1, 50.0);
    shouldDraw && draw();
  });

  Shaders.initFromElems(gl, ELEMS.vshader, ELEMS.fshader);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const LOCATIONS = Shaders.getLocations(gl, [
    'a_Position', 'a_Normal',
    'u_NormalMatrix', 'u_MvpMatrix', 'u_ModelMatrix',
    'u_LightColor', 'u_AmbientLight', 'u_LightPosition'
  ]);

  const NBUFFER = WebGLUtils.initBuffer(gl, null, 3, gl.FLOAT,
                                        LOCATIONS.a_Normal);
  const VBUFFER = WebGLUtils.initBuffer(gl, null, 3, gl.FLOAT,
                                        LOCATIONS.a_Position);
  const IBUFFER = WebGLUtils.initBuffer(gl, null, null, gl.FLOAT, null,
                                        gl.ELEMENT_ARRAY_BUFFER);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  /**
   * Draws the corresponding OBJ loaded.
   * @param {Object} obj object obtained from
   * ObjParser::parse
   */
  function draw_obj (obj) {
    if (obj._new) { // caching
      VERTICES = new Float32Array(obj.vertices);
      INDICES = new Uint16Array(obj.faces);
      if (obj.vertices_normals && obj.vertices_normals.length)
        NORMALS = new Float32Array(obj.normals);
      else
        NORMALS = new Float32Array(ObjParser.calculateNormals(obj.vertices, obj.faces));
      obj._new = false;
    }

    modelMatrix.scale(obj._scale, obj._scale, obj._scale);
    modelMatrix.rotate(_rotations['ROTATE_X'], 1.0, 0.0, 0.0);
    modelMatrix.rotate(_rotations['ROTATE_Y'], 0.0, 1.0, 0.0);
    modelMatrix.rotate(_rotations['ROTATE_Z'], 0.0, 0.0, 1.0);
    modelMatrix.translate(...(obj._center_of_mass.map((el) => -el)));

    gl.bindBuffer(gl.ARRAY_BUFFER, VBUFFER);
    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, NBUFFER);
    gl.bufferData(gl.ARRAY_BUFFER, NORMALS, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBUFFER);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);

    return INDICES.length;
  }

  /**
   * Draws the entire scene.
   */
  function draw () {
    modelMatrix = new Matrix4();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(LOCATIONS.u_LightColor, new Float32Array([1.0, 1.0, 1.0]));
    gl.uniform3fv(LOCATIONS.u_AmbientLight, new Float32Array([0.2, 0.2, 0.2]));
    gl.uniform3fv(LOCATIONS.u_LightPosition, new Float32Array([0.0, 500.0, 200.0]));

    viewProjMatrix.setPerspective(30.0, ELEMS.canvas.width/ELEMS.canvas.height,
                                  0.1, 50.0);
    viewProjMatrix.lookAt(0.0, 0.0, 10.0, // eye
                          0.0, 0.0, 0.0,     // at
                          0.0, 1.0, 0.0);    // up

    let N = draw_obj(obj);

    // Calculate the model view project matrix and pass it to u_MvpMatrix
    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(LOCATIONS.u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(LOCATIONS.u_NormalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(LOCATIONS.u_MvpMatrix, false, mvpMatrix.elements);

    gl.drawElements(gl.TRIANGLES, N, gl.UNSIGNED_SHORT, 0);
  }

  ELEMS.fileinput.addEventListener('change', (ev) => {
    let file = ev.target.files && ev.target.files[0];
    let reader = new FileReader();

    if (!file)
      console.error('Error while handling file.', file);

    ELEMS.filename.hidden = false;
    ELEMS.filename.innerHTML = file.name;
    current_file = file;

    reader.onload = (ev) => {
      obj = ObjParser.parse(ev.target.result);
      resize(false);
      !_looping && loop();
    };

    reader.readAsText(file);
  });

  window.addEventListener('resize', resize);

  ELEMS.filebtn.addEventListener('click', (ev) => {
    ELEMS.fileinput.click();
  });

  function loop () {
    window.requestAnimationFrame(loop);

    for (let rot in _rotating)
      if (_rotating[rot])
        incRotation(rot);
    draw();
  }
})(window, document);
