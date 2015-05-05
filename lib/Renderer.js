/**
 *  Depending on object's type we must render
 *  in a special way (specifying drawing mode,
 *  for example). So, each type of object must
 *  the specify its type so that we are able to
 *  easily decide in a switch stament.
 *
 *  Another question is regarding rendering
 *  indexed stuff or not (we also need to
 *  segregate these).
 *
 *  ps.: we must also send normals and colors as
 *  well.
 */
class Renderer {
  constructor (canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;

    this._curr_program;
  }
}
