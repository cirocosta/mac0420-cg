//TODO fix this

let canvas = document.querySelector('canvas');
let gl = WebGLUtils.setupWebGL(canvas);
let points = [];

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(.0, .0, .0, 1.);

if (!WebGLUtils.Shaders.initFromElems(gl,
      document.getElementById('vshader'),
      document.getElementById('fshader'))) {
  throw new Error('Failed to initialize shaders');
}

let bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_Position);

/**
 * Generates a circle by approximating its
 * points by rectangle subdivision.
 *
 * Remember:
 * - Circle eq:
 *     (x-a)^2 + (y-b)^2 = r^2
 *        a: center_x
 *        b: center_y
 *        r: radius
 * - by pytagorean triangle eq:
 *   - apothem: (r*sqrt(2))/2
 *   - side: r*sqrt(2)
 *
 *  a       b
 *   |-----|
 *   |     |
 *   |-----|
 *  d       c
 *
 * @param  {number} r radius
 */
function gen_circle (r) {
  const SQRT_2 = Math.sqrt(2);
  let apo = r*SQRT_2/2;
  let side = r*SQRT_2
  let vertices = [
    MV.vec2(-apo, side/2),  // a
    MV.vec2(apo, side/2),   // b
    MV.vec2(-apo, -side/2), // d
    MV.vec2(apo, -side/2),  // c
  ];

  let count = 3;

  recurse(vertices[0], vertices[1], count);
  recurse(vertices[1], vertices[2], count);
  recurse(vertices[2], vertices[3], count);
  recurse(vertices[3], vertices[0], count);
}

function recurse (a, b, count) {
  if (!count--)
    return add_to_points(a, b);

  recurse(normalize_point(MV.bisect(a, b, 0.5)), b, count);
}

function normalize_point ([a, b]) {
  console.log(a, b);
  let norm = Math.sqrt(a*a + b*b);

  return [a/norm, b/norm];
}

function add_to_points () {
  points.push(...Array.from(arguments));
}

gen_circle(1);
console.log(points);

function render () {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bufferData(gl.ARRAY_BUFFER, MV.flatten32f(points), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);
}

(function loop () {
  window.requestAnimationFrame(loop);
  render();
})();
