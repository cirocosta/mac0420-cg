class PerspectiveCamera extends Camera {
  constructor (fov, aspect_ratio, near, far) {
    this.fov = fov;
    this.aspect_ratio = aspect_ratio;
    this.near = near;
    this.far = far;
  }
}
