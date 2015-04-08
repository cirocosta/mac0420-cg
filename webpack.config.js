'use strict';

module.exports = {
  entry: {
    '6-cubes': "./demos/6-cubes",
    '4-obj-reader': "./demos/4-obj-reader",
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].entry.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?optional=runtime'
      },
    ]
  }
};

