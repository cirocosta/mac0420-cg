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

import {vec3} from "gl-matrix";
import {Store} from "./Store";
import {ELEMS} from "./frontend";
import {World} from "../../lib/World";
import {Renderer} from "../../lib/Renderer";
import {PerspectiveCamera} from "../../lib/PerspectiveCamera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Inhabitant} from "../../lib/Inhabitant";
import {ARRAY_BUFFER} from "../../lib/Constants";
import {ObjParser} from "../../lib/ObjParser";

const canvas = document.querySelector("canvas");

let world = new World();
let renderer = new Renderer(canvas);
let camera = new PerspectiveCamera(
  70, canvas.clientWidth/canvas.clientHeight, 1.0, 100.0
);

camera.setPosition([0.0, 0.0, 0.0], true);

Store.listenTo('objGeometries', () => {
  let geom = Store.consume('objGeometries');
  let inh = new Inhabitant(geom, new Material({}), false);
  inh.setPosition([0.0,0.0,-10.0]);

  world.populate(inh);
  renderer.render(world, camera);
});

document.addEventListener('mousewheel', (e) => {
  camera.fov -= event.wheelDeltaY * 0.05;
  camera.updateProjection(camera.ar);
  camera.updateInverseProjection(camera.ar);
}, false);


canvas.addEventListener('click', (evt) => {
  console.log('click');
});

function loop () {
  window.requestAnimationFrame(loop);
  renderer.render(world, camera);
}
loop();

