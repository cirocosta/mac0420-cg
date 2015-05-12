import WebGLUtils from "../assets/webgl-utils";

/**
 * Geometry from OBJ files. This should actually
 * inherit from Geometry but there are a few
 * things that we'd have to change before.
 * TODO
 */
export class ObjGeometry {
  constructor (obj) {
    this.vertices = new Float32Array(obj.vertices);
    this.indices = new Uint16Array(obj.indices);
    this.flat_normals = new Float32Array(obj.flat_normals);
    this.smooth_normals = new Float32Array(obj.smooth_normals);

    this._vecMin = obj.vecMin;
    this._vecMax = obj.vecMax;
    this.center_of_mass = obj.center_of_mass;
    this.scale = obj.scale;

    this.buffers = {};
  }

  destruct (gl) {
    for (buffer of this.buffers) {
      if (buffer)
        gl.deleteBuffer(buffer);
    }
  }

  _prepareBuffers (gl, locations) {
    if (!(this.buffers.vertices &&
          this.buffers.indices && this.buffers.normals)) {
      this.buffers.normals =
         WebGLUtils.initBuffer(gl, null, 3, gl.FLOAT, locations.a_Normal);
      this.buffers.vertices =
         WebGLUtils.initBuffer(gl, null, 3, gl.FLOAT, locations.a_Position);
      this.buffers.indices =
         WebGLUtils.initBuffer(gl, null, null, gl.FLOAT, null,
                               gl.ELEMENT_ARRAY_BUFFER);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals);
    gl.bufferData(gl.ARRAY_BUFFER, this.flat_normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  draw (gl) {
    if (!this.meshGrid) {
      gl.drawElements(gl.TRIANGLES, this.indices.length,
                      gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }

};

