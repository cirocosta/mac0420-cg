var program;
var canvas;
var gl;
var obj;

var vPosition;
var vNormal;

var NBUFFER;
var IBUFFER;
var VBUFFER;

var VERTICES;
var INDICES;
var NORMALS;

var _smoothShading = false;
var _obj_buffers = false;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var resize;

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = vec4(cross(t1, t2), 0);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    var scaleFactor = canvas.width;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    resize = genResizeFun(canvas, gl, function (w, h, shouldDraw) {
      var ar = w/h;

      xleft = -2 * ar;
      xright = 2 * ar;
      ybottom = -2.0;
      ytop = 2.0;

      gl.viewport(0, 0, w, h);
    });
    window.onresize = resize;

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // draw simple cube for starters
    colorCube();

    // create vertex and normal buffers
    createBuffers();

    thetaLoc = gl.getUniformLocation(program, "theta");

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById('ButtonS').onclick = function(){
      _smoothShading = !_smoothShading;
      obj && (obj.new = true);

      console.log(_smoothShading);
    };

    document.getElementById('files').onchange = readFile;

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    resize();
    render();
}

function readFile (ev) {
  var file = ev.target.files && ev.target.files[0];
  var reader = new FileReader();

  if (!file)
    console.error('Error while handling file.', file);

  reader.onload = function (ev) {
    obj = parse(ev.target.result);
    // resize(false);
    // !_looping && loop();
  };

  reader.readAsText(file);
}

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 2.0;

    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi),
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
    // modelViewMatrix = mult(modelViewMatrix, scale([1.0, 1.0, 1.0]));

    if (obj) {
      numVertices = draw_obj();

      projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
      gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

      gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);
    } else {
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
      modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));

      projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
      gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

      gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    }

    requestAnimFrame(render);
}

/**
 * Desenha o objeto se carregado.
 */
function draw_obj () {
  if (!obj)
    return 0;

  if (!_obj_buffers)
    createObjBuffers();

  if (obj.new) { // caching
    VERTICES = new Float32Array(obj.vertices);
    INDICES = new Uint16Array(obj.indices);
    if (_smoothShading)
      NORMALS = new Float32Array(obj.smooth_normals);
    else
      NORMALS = new Float32Array(obj.flat_normals);

    obj.new = false;
  }

  modelViewMatrix = mult(modelViewMatrix, scale([obj.scale, obj.scale, obj.scale]));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
  modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
  modelViewMatrix = mult(modelViewMatrix, translate(obj.center_of_mass.map(function (el) {
    return -el;
  })));

  gl.bindBuffer(gl.ARRAY_BUFFER, VBUFFER);
  gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, NBUFFER);
  gl.bufferData(gl.ARRAY_BUFFER, NORMALS, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBUFFER);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);

  return INDICES.length;
}

function createObjBuffers () {
  NBUFFER = initBuffer(gl, null, 3, gl.FLOAT, vNormal);
  VBUFFER = initBuffer(gl, null, 3, gl.FLOAT, vPosition);
  IBUFFER = initBuffer(gl, null, null, gl.FLOAT, null, gl.ELEMENT_ARRAY_BUFFER);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initBuffer (gl, data, num, type, attrib_location, buffer_type) {
  if (arguments.length < 5)
    throw new Error('initSimpleArrayBuffer requires all args');

  var buff = gl.createBuffer();
  if (!buff)
    throw new Error('Error while creating buffer');

  buffer_type = buffer_type || gl.ARRAY_BUFFER;

  gl.bindBuffer(buffer_type, buff);
  if (data != null)
    gl.bufferData(buffer_type, data, gl.STATIC_DRAW);
  if (attrib_location != null && num != null)
    gl.vertexAttribPointer(attrib_location, num, type, false, 0, 0);
    gl.enableVertexAttribArray(attrib_location);

  return buff;
};

function genResizeFun (canvas, gl, fun) {
  return function (shouldDraw) {
    var clientWidth = canvas.clientWidth;
    var clientHeight = canvas.clientHeight;

    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
      canvas.width = clientWidth;
      canvas.height = clientHeight;

      gl.viewport(0, 0, canvas.width, canvas.height);
      fun && fun.call(null, clientWidth, clientHeight, shouldDraw);
    }
  }
};

function createBuffers(points, normals) {

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}
