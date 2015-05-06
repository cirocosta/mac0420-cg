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

  add (mesh) {
    this.inhabitants.push(mesh);
  }
};

