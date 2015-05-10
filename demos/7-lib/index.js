"use strict";

/**
 * Rationale:
 *
 * There's a world that we populate with a few
 * corpuses. Each of these, if wanting to appear
 * on a camera, must also set up a material for
 * it and blend itself with the material, forming
 * a Inhabitant. Inhabitants are added to the world so that
 * a camera might look at it. In our current
 * world there's only one lightsource (which is a
 * shame).
 */

import {World} from "../../lib/World";
import {Renderer} from "../../lib/Renderer";
import {PerspectiveCamera} from "../../lib/PerspectiveCamera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Inhabitant} from "../../lib/Inhabitant";
import {ARRAY_BUFFER} from "../../lib/Constants";

const canvas = document.querySelector("canvas");

let world = new World();
let renderer = new Renderer(canvas);
let camera = new PerspectiveCamera(
  70, window.innerWidth/window.innerHeight, 0.1, 1000.0
);

const vertices = new Float32Array([
  0.0, 0.5, 0.0,
  0.5, 0.0, 0.0,
  -0.5, 0.0, 0.0,
  0.0, -0.5, 0.0
]);

let square = new Geometry({
  vertices: vertices,
  vertices_num: 4,
  type: ARRAY_BUFFER
});
let material = new Material({
  color: new Float32Array(1.0, 0.0, 0.0)
});
let inhabitant = new Inhabitant(square, material);
inhabitant.setRotation([0.0, 0.0, 1.0], 90);
inhabitant.setPosition([0.4, 0.0, 0.0]);
inhabitant.setScale([1.2, 1.0, 1.0]);

world.add(inhabitant);
renderer.render(world, camera);




