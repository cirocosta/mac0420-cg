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
    flatten ([first, ...rest]) {
      if (first === undefined)
        return [];
      else if (!Array.isArray(first))
        return [first, ...this.flatten(rest)];
      else
        return [...this.flatten(first), ...this.flatten(rest)];
    },

    /**
     * Flattens an array and transforms it in a
     * type array (Float32Array)
     * @param  {Array<Array>} arr
     * @return {Float32Array}
     */
    flatten32f (arr) {
      return new Float32Array(this.flatten(arr));
    },

    /**
     * Bissects an array given an 's'
     * (0 <= S <= 1)
     *
     * @param  {Array} u
     * @param  {Array} v
     * @param  {number} s
     * @return {Array}
     */
     bisect: (u, v, s) => u.map((val, i) => (s*val + (1.0-s) * v[i]))
  };
})(window);
