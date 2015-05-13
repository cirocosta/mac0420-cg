"use strict";

import {vec3, vec4, quat, mat4} from "gl-matrix";

export class ArcBall {
  /**
   * @param {num} width
   * @param {num} height
   */
  constructor (width, height) {
    this.width = width;
    this.height = height;

    // final transformation
    this.transform = mat4.create();
    // last rotation experienced at the end of
    // dragging. Accumulates the rotations
    this.lastRot = mat4.create();
    // the rotation that was set while dragging
    this.currentRot = mat4.create();

    this.mouse = {
      x: 0.0, y: 0.0,
      isLClicked: false,
      isRClicked: false,
      dragging: false,
    };

    this.r = 1.0;
    this.startVec = vec3.create();
    this.endVec = vec3.create();
  }

  genMouseDownListener () {
    return (e) => {
      if (e.button == 0)
        this.mouse.isLClicked = true;
      else
        this.mouse.isRClicked = true;
    };
  }

  genMouseUpListener () {
    return (e) => {
      if (e.button == 0)
        this.mouse.isLClicked = false;
      else
        this.mouse.isRClicked = false;
    };
  }

  genMouseMoveListener () {
    return (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
  }

  start () {
    document.addEventListener('mousedown', this.genMouseDownListener());
    document.addEventListener('mouseup', this.genMouseUpListener());
    document.addEventListener('mousemove', this.genMouseMoveListener());
  }

  /**
   * @param vec2 point
   * @return vec3 point on sphere
   */
  mapToSphere (point) {
    let x = 2 * (point[0] / this.width) - 1;
    let y = 1 - 2 * (point[1] / this.height);
    let newvec = vec3.create();

    // sqr length
    let length = x*x + y*y;

    // outside
    if (length > this.r * this.r) {
      let norm = this.r / Math.sqrt(length);

      newvec[0] = x * norm;
      newvec[1] = y * norm;
      newvec[2] = 0.0;
    } else { //inside
      newvec[0] = x;
      newvec[1] = y;
      newvec[2] = Math.sqrt(this.r*this.r - length);
    }

    return newvec;
  }

  /**
   * On the first click, calculates the start
   * vector
   */
  click () {
    this.startVec = this.mapToSphere([this.mouse.x, this.mouse.y]);
  }

  /**
   * Updates the end vector using the newpoint
   * that comes from input. It also updates the
   * quaternion with the resultant rotation
   */
  drag () {
    let newRot = vec4.create();
    let perp = vec3.create();
    this.endVec = this.mapToSphere([this.mouse.x, this.mouse.y]);

    vec3.cross(perp, this.startVec, this.endVec);
    if (vec3.length(perp) > 0) {
      newRot[0] = perp[0];
      newRot[1] = perp[1];
      newRot[2] = perp[2];
      newRot[3] = vec3.dot(this.startVec, this.endVec);
    } else {
      newRot = vec4.create();
    }

    return newRot;
  }

  resize (width, height) {
    this.width = width;
    this.height = height;
  }

  update () {
    if (!this.mouse.dragging) {
      if (this.mouse.isLClicked) {
        this.mouse.dragging = true;
        this.lastRot = this.currentRot;
        this.click();
      }
    } else {
      if (this.mouse.isLClicked) {
        let thisQuat = quat.create();

        thisQuat = this.drag();
        this.currentRot = mat4.fromQuat(mat4.create(), thisQuat);

        mat4.multiply(this.currentRot, this.currentRot, this.lastRot);
        this.transform = this.currentRot;
      } else {
        this.mouse.dragging = false;
      }
    }
  }

}

