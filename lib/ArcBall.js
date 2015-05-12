"use strict";

import {quat, mat3, mat4} from "gl-matrix";

/**
 * Calculate the length of the vector and
 * determine whether or not its inside or
 * outside of the sphere bounds.
 *
 * If 1: return a vector from within the sphere
 * else: normalize the point and return the
 *       closest point to outside of the sphere
 *
 * Having two vectors, we are then able to
 * calculate a perpendicular vector to them
 * with an angle, which turns out to be a
 * quaternion
 */

class ArcBall {
  /**
   * Width and height of the current window
   */
  constructor (width, height) {
    this.width = width;
    this.height = height;
    this.rot = quat.create();

    // final transformation
    this.transform = mat4.create();
    // last rotation experienced at the end of
    // dragging. Accumulates the rotations
    this.lastRot = mat3.create();
    // the rotation that was set while dragging
    this.currentRot = mat3.create();

    this.mouse = {
      x: 0.0, y: 0.0,
      isClicked: false,
      isRClicked: false,
    };

    this.r = 1.0;
    this.startVec = vec3.create();
    this.endVec = vec3.create();
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
  click (point) {
    this.startVec = this.mapToSphere(point);
  }

  genMouseDownListener () {
    return (e) => {
      if (e.button == 0)
        console.log('down: left!');
      else
        console.log('down: right!');
    };
  }

  genMouseUpListener () {
    return (e) => {
    };
  }

  genMoveEventListener () {
    return (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
  }

  /**
   * Updates the end vector using the newpoint
   * that comes from input. It also updates the
   * quaternion with the resultant rotation
   */
  drag (point) {
    let newRot = vec4.create();
    let perp = vec3.create();
    this.endVec = this.mapToSphere(point);

    ve3.cross(perp, this.startVec, this.endVec);
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


  main () {
    if (!isDragging) {
      if (isClicked) {
        isDragging = true;
        this.lastRot = this.currentRot;
        this.click(mousePoint);
      }
    } else {
      if (isClicked) {
        let thisQuat = quat.create();
        this.drag(MousePt, Thisqt);
        this.currentRot = mat3.fromQuat(mat3.create(), thisQuat);
        mat3.multiply(this.currentRot, this.currentRot, this.lastRot);
        mat4.rotationFromMat3(this.transform, this.currentRot);
      } else {
        isDragging = false;
      }
    }
  }

}

