'use strict';

module.exports = {
  entry: {
    '0-background-clearing': "./demos/0-background-clearing",
    '1-rotating-squares': "./demos/1-rotating-squares",
    '2-circle-approximations': "./demos/2-circle-approximations",
    '3-triangles': "./demos/3-triangles",
    // '4-obj-reader': "./demos/4-obj-reader",
    '5-textures': "./demos/5-textures",
    '6-cubes': "./demos/6-cubes",
    '7-lib': "./demos/7-lib",
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?optional=runtime'
      },
      {
        test: /\.glsl$/,
        loader: 'shader'
      }
    ]
  },
};

