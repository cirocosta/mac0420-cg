import {Camera} from "./Camera";

class OrthographicCamera extends Camera {
  constructor (l, r, b, t, n, f, ar) {
    super();

    this.ar = ar;
    this.left = l;
    this.right = r;
    this.bottom = b;
    this.top = t;
    this.near = n;
    this.far = f;

    this.updateProjection(this.ar);
  }

  updateProjection (ar) {
    mat4.ortho(this._projectionMatrix,
               -2.5 * ar, 2.5 * ar, -2.5, 2.5, this.near, this.far);
  }

  updateInverseProjection () {
    //todo
  }
}

export default OrthographicCamera;
