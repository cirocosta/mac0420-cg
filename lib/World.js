/**
 * Contains all of the objects to be rendered.
 *
 * Although one might argue that camera belongs
 * to the world, as it's not rendered, it
 * doesn't belong here.
 */
export class World {
  constructor () {
    this.inhabitants = [];
  }

  /**
   * Adds an inhabitant to the world.
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
   *
   * @param {Ray}
   * @param {Camera}
   * @return {array} sorted intersections
   */
  getIntersections (ray, camera) {
    let intersections = [];
    let intersection = false;

    for (let i in this.inhabitants) {
      intersection = this.inhabitants[i].intersect(ray, camera);

      if (intersection) {
        intersections.push({
          index: i,
          intersection: intersection
        });
      }
    }

    intersections.sort((a,b) => {
      return a.intersection - b.intersection;
    });

    return intersections;
  }
};

