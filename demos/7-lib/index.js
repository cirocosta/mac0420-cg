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
import {Camera} from "../../lib/Camera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Inhabitant} from "../../lib/Inhabitant";
import {ARRAY_BUFFER} from "../../lib/Constants";
import {Ray} from "../../lib/Ray";
import {Sphere} from "../../lib/Sphere";
import {Line} from "../../lib/Line";


const canvas = document.querySelector("canvas");

let world = new World();
let renderer = new Renderer(canvas);
let camera = new Camera(
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
camera.position = vec3.clone([0.0, 0.0, 5.0]);
camera.lookAt = vec3.clone([0.0, 0.0, 0.0]);
camera.updateView();

let material = new Material({
  color: new Float32Array(1.0, 0.0, 0.0)
});
let inhabitant = new Inhabitant(cube, material);
let sphere = new Inhabitant(new Sphere(1.0), material, false);

inhabitant.setPosition([-0.0, 0.0, -10.0]);
sphere.setPosition([-3.0, 0.0, -5.0]);

// world.add(lineInhabitant);
world.populate(inhabitant);
world.populate(sphere);

canvas.addEventListener('click', (evt) => {
  ray.generate(canvas, camera, evt.clientX, evt.clientY);
  console.log(world.getIntersections(ray, camera));
});

renderer.render(world, camera);

