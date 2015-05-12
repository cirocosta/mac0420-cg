/**
 * Contains all of the objects to be rendered.
 * Although one might argue that camera belongs
 * to the world, as it's not rendered, it
 * doesn't belong here.
 */
export class World {
  constructor () {
    this.inhabitants = [];
  }

  /**
   * Adds a mesh to the world.
   *
   * @param {Inhabitant}
   */
  populate (inhabitant) {
    this.inhabitants.push(inhabitant);
  }

  /**
   * Given a ray, tests the intersections that
   * might happen between inhabitants and the
   * ray
   */
  getIntersections (ray, camera) {
    let intersections = [];

    for (let i in this.inhabitants)
      intersections.push(this.inhabitants[i].intersect(ray, camera));

    return intersections;
  }
};

