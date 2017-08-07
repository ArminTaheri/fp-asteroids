const debug = process.env.NODE_ENV !== "production";

const path = require('path');
const webpack = require('webpack');
const ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = {
  entry: [
      path.join(__dirname, '/src/main.js')
  ],
  output: {
      path: path.join(__dirname, '/dist'),
      filename: 'bundle.min.js'
  },
  plugins: debug ? [] : [
    new ClosureCompilerPlugin({
      compiler: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        compilation_level: 'ADVANCED'
      },
      concurrency: 3,
    }),
  ],
};
