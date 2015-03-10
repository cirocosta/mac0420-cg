window.onerror = function (msg, url, n) {
  console.error(url + "(" + msg + ")" + n);
}

function createShader (str, type) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);

  return shader;
}

function createProgram (vstr, fstr) {
  let program = gl.createProgram();
  let vshader = createShader(vstr, gl.VERTEX_SHADER);
  let fshader = createShader(fstr, gl.FRAGMENT_SHADER);

  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw gl.getProgramInfoLog(program);

  return program;
}
