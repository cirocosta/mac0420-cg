/**
 * Basic description of the appearance of the
 * object mesh to be rendered.
 */
export class Material {
  constructor (data={}) {
    this.color = data.color;

    this.ambient = data.color;
    this.diffuse = data.color;
    this.specular = data.color;

    this._buffers = {
      amb: null,
      dif: null,
      spec: null
    };
  }


  // TODO think about this proeprly after
  _prepareBuffers (gl, locations) {
    if (!this._buffers.color)
      this._buffers.color = gl.createBuffer();
    if (!this._buffers.amb)
      this._buffers.amb = gl.createBuffer();
    if (!this._buffers.amb)
      this._buffers.amb = gl.createBuffer();
    if (!this._buffers.amb)
      this.buffers.amb = gl.createBuffer();


    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.amb);
    gl.vertexAttribPointer(locations.a_mat_amb,
                           this.ambient, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locations.a_mat_amb);
    gl.bufferData(this.ambient);
  }
};

