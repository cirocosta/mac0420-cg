"use strict";

/**
 * Rationale:
 *
 * There's a world that we populate with a few
 * corpuses. Each of these, if wanting to appear
 * on a camera, must also set up a material for
 * it and blend itself with the material, forming
 * a Inhabitant. Inhabitants are added to the
 * world so that a camera might look at it. In
 * our current world there's only one lightsource
 * (which is a shame).
 */

import {World} from "../../lib/World";
import {vec3} from "gl-matrix";
import {Renderer} from "../../lib/Renderer";
import {PerspectiveCamera} from "../../lib/PerspectiveCamera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Inhabitant} from "../../lib/Inhabitant";
import {ARRAY_BUFFER} from "../../lib/Constants";
import {Ray} from "../../lib/Ray";
import {Line} from "../../lib/Line";


const canvas = document.querySelector("canvas");

let world = new World();
let renderer = new Renderer(canvas);
let camera = new PerspectiveCamera(
  70, canvas.clientWidth/canvas.clientHeight, 1.0, 100.0
);
let ray = new Ray();

const vertices = new Float32Array([
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
]);

const indices = new Uint8Array([
  0, 1, 2,   0, 2, 3,    // front
  0, 3, 4,   0, 4, 5,    // right
  0, 5, 6,   0, 6, 1,    // up
  1, 6, 7,   1, 7, 2,    // left
  7, 4, 3,   7, 3, 2,    // down
  4, 7, 6,   4, 6, 5     // back
]);

let cube = new Geometry({
  vertices: vertices,
  indices: indices,
  vertices_num: 8,
});
camera.setPosition([0.2, 0.0, 0.0], true);

let material = new Material({
  color: new Float32Array(1.0, 0.0, 0.0)
});
let inhabitant = new Inhabitant(cube, material);

inhabitant.setPosition([-1.0, 0.0, -10.0]);

// world.add(lineInhabitant);
world.add(inhabitant);

canvas.addEventListener('click', (evt) => {
  ray.generate(canvas, camera, evt.clientX, evt.clientY);
  console.log(world.getIntersections(ray, camera));
});

renderer.render(world, camera);

