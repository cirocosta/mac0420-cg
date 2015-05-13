"use strict";

import {vec3, mat4} from "gl-matrix";

/**
 * Axis Aligned Bounding Box.
 *
 * Every Inhabitant creates this during its
 * instantiation by calling geom.getBB
 *
 * Rememeber: AABB must be ALWAYS in the world
 * coordinate system.
 */
export class AABB {

  constructor (min, max, body) {
    if (Object.keys(arguments).length < 3)
      throw new Error('must pass 3 args to constructor AABB');

    if (!(min.length >= 3 && max.length >= 3))
      throw new Error("AABB must receive min and max vec3s");

    this._body = body;
    this.vecMin = min;
    this.vecMax = max;
  }

  /**
   * Performs the calculation of the clip line
   * between an AABB and the line.
   *
   * - ATTENTION:
   * The fourth parameter (fracs) works like a
   * pass-by-reference variable. This method will
   * mutate it.
   *
   * @param {number} dimension
   * @param {vec3} linev0
   * @param {vec3} linev1
   * @param {Object} fracs
   *
   * @return bool
   */
  _clipLine(d, v0, v1, min, max, fracs) {
    // temp varible for swapping
    let t;
    let f_dim_low, f_dim_high;

    f_dim_low = (min[d] - v0[d])/(v1[d] - v0[d]);
    f_dim_high = (max[d] - v0[d])/(v1[d] - v0[d]);

    // Make sure low is less than high
    if (f_dim_high < f_dim_low) {
      t = f_dim_low;
      f_dim_low = f_dim_high;
      f_dim_high = t;
    }

    // If this dimension's high is less than the low
    // we got then we definitely missed.
    if (f_dim_high < fracs.low)
      return false;

    // Likewise if the low is less than the high.
    if (f_dim_low > fracs.high)
      return false;

    // Add the clip from this dimension to the previous
    fracs.low = Math.max(f_dim_low, fracs.low);
    fracs.high = Math.min(f_dim_high, fracs.high);

    if (fracs.low > fracs.high)
      return false;

    return true;
  }

  /**
   * vecMin and vecMax are always defined only
   * relative to its own, i.e, in its local
   * coordinate system. This method sends it to
   * the global coord by multipying by the rigid
   * body's model matrix.
   */
  _getWorldCoordVecs () {
    let min = vec3.clone(this.vecMin);
    let max = vec3.clone(this.vecMax);

    vec3.transformMat4(min, min, this._body.getModelMatrix());
    vec3.transformMat4(max, max, this._body.getModelMatrix());

    return [min, max];
  }

  // Find the intersection of a line from v0 to
  // v1 and an axis-aligned bounding box
  // notice: both LINE and AABB must be in the
  // same system of reference.
  lineIntersect(v0, v1, camera) {
    let [min, max] = this._getWorldCoordVecs();

    // console.log('---');
    // console.log(v0, v1);     // ray
    // console.log(min, max);   // aabb
    // console.log('---');
    let fracs = {
      low: 0.0,
      high: 1.0,
    };

    if (!this._clipLine(0, v0, v1,min, max, fracs))
      return false;

    if (!this._clipLine(1, v0, v1,min, max, fracs))
      return false;

    if (!this._clipLine(2, v0, v1,min, max, fracs))
      return false;

    return fracs.low;
  }
};
