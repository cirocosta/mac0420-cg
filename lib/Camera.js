"use strict";

/**
 * It makes sense to set camera as an inherited
 * class from body as it needs:
 *  - positioning (body.position)
 *  - directioning (body.up, body.lookAt)
 *
 * More than this, a camera must also define:
 *  - choosing a type of lens -> the projection
 *  - choose clipping
 *
 * By default:
 *  - directs to -z
 *  - cube of size 2 (orthographic)
 *  - has an identity as its model-view matrix
 */

import {Body} from "./Body";
import {mat4} from "gl-matrix";

export class Camera extends Body {
  constructor () {
    super();

    this._viewMatrix = mat4.create();
    this._perspectiveMatrix = mat4.create();
  }
};

