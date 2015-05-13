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
import {Camera} from "../../lib/Camera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Inhabitant} from "../../lib/Inhabitant";
import {ARRAY_BUFFER} from "../../lib/Constants";
import {ObjParser} from "../../lib/ObjParser";
import {Ray} from "../../lib/Ray";
import {ArcBall} from "../../lib/ArcBall";

let world = new World();
let renderer = new Renderer(ELEMS.canvas);
let ray = new Ray();
let arcball = new ArcBall(ELEMS.canvas.clientWidth,
                          ELEMS.canvas.clientHeight);
let camera = new Camera(
  30, ELEMS.canvas.clientWidth/ELEMS.canvas.clientHeight, 0.1, 100.0
);
camera.position = [0.0, 1.0, 5.0];

Store.listenTo('objGeometries', () => {
  let geom = Store.consume('objGeometries');
  let inh = new Inhabitant(geom, new Material({}));
  inh.setPosition([0.0,0.0,-10.0]);

  world.populate(inh);
});


document.addEventListener('mousewheel', (e) => {
  camera.fov -= event.wheelDeltaY * 0.05;
}, false);

function shootRay (evt) {
  let min = 999.0;
  let min_i = -1;
  ray.generate(ELEMS.canvas, camera, evt.clientX, evt.clientY);
  let intersections = world.getIntersections(ray, camera);

  for (let i = 0; i < intersections.length; i++) {
    if (intersections[i] < min) {
      min_i = i;
      min = intersections[i];
    }
  }

  console.log(world.inhabitants[min_i]);
}

ELEMS.canvas.addEventListener('click', (evt) => {
  if (Store.retrieve('appState')['SELECT']) {
    shootRay(evt);
  }
});


renderer.render(world, camera);
window.addEventListener('resize', renderer.adjustSize.bind(renderer));
arcball.start();

const loop = () => {
  arcball.update();

  if (world.inhabitants.length > 0)
    world.inhabitants[0]._modelMatrix = arcball.transform;

  window.requestAnimationFrame(loop);
  renderer.render(world, camera);
};
loop();

