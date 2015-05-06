"use strict";

import {World} from "../../lib/World";
import {Renderer} from "../../lib/Renderer";
import {PerspectiveCamera} from "../../lib/PerspectiveCamera";
import {Geometry} from "../../lib/Geometry";
import {Material} from "../../lib/Material";
import {Mesh} from "../../lib/Mesh";
import {ARRAY_BUFFER} from "../../lib/Constants";

const canvas = document.querySelector("canvas");

let world = new World();
let renderer = new Renderer(canvas);
let camera = new PerspectiveCamera(
  70, window.innerWidth/window.innerHeight, 0.1, 1000.0
);

const vertices = new Float32Array([
  0.0, 0.5,
  0.5, 0.0,
  -0.5, 0.0,
  0.0, -0.5
]);

let cube = new Geometry({
  vertices: vertices,
  vertices_num: 4,
  type: ARRAY_BUFFER
});
let material = new Material({
  color: new Float32Array(1.0, 0.0, 0.0)
});
let mesh = new Mesh(cube, material);

world.add(mesh);
renderer.render(world, camera);

