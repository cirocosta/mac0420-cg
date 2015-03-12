(function (root) {
  'use strict';

  /**
   * Matrix and Vector operations
   */
  root.MV = {
    /**
     * GLSL-a-like vector constructors.
     */
    vec2: (a1=.0,a2=.0)=>Array.from(arguments),
    vec3: (a1=.0,a2=.0,a3=.0)=>Array.from(arguments),
    vec4: (a1=.0,a2=.0,a3=.0,a4=.0)=>Array.from(arguments),

    /**
     * Make a nested array flat.
     * @param  {Array<Array>} arr
     * @return {Array}
     */
    flatten: (arr) => {
      let newArr = [];

      var recursiveArr = (givenArr) => {
        givenArr.forEach((item) => {
          (Array.isArray(item)) && (recursiveArr(item));
          (!Array.isArray(item)) && (newArr.push(item));
        });
      };

      return recursiveArr(arr);
    },

    /**
     * Flattens an array and transforms it in a
     * type array (Float32Array)
     * @param  {Array<Array>} arr
     * @return {Float32Array}
     */
    flatten32f: (arr) => new Float32Array(this.flatten(arr)),

    /**
     * Bissects an array given an 's'
     * (0 <= S <= 1)
     *
     * @param  {number} u
     * @param  {number} v
     * @param  {number} s
     * @return {Array}
     */
    bisect: (u, v, s) => [for (i of u) for (j of v) s*i + (1.0-s) * j],
  };
})(window);
