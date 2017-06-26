import {Geometry} from "./Geometry";
import {vec3} from "gl-matrix";

export class Sphere extends Geometry {
  constructor (r) {
    let latitude = 0.0;
    let longitude = 0.0;
    let vertices = [];
    let vertices_num;

    for (; longitude < 180.0; longitude += 20.0) {
      for (; latitude < 90.0; latitude += 10) {
        let x = r * Math.sin(latitude) * Math.cos(longitude);
        let y = r * Math.cos(latitude) * Math.cos(longitude);
        let z = r * Math.sin(longitude);

        vertices.push(x, y, z);
      }
    }

    vertices_num = vertices.length / 3;

    super({
      vertices_num: vertices_num,
      vertices: new Float32Array(vertices),
    });
  }

  draw (gl) {
    gl.drawArrays(gl.LINES, 0, this.vertices.length);
  }
};
