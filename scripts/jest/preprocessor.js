/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var babel = require('@babel/core');
var createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
var fbjsConfigurePreset = require('babel-preset-fbjs/configure');
var moduleMap = require('../module-map');
var path = require('path');

module.exports = {
  process(src, filename) {
    var options = {
      presets: [fbjsConfigurePreset({rewriteModules: {map: moduleMap}})],
      filename: filename,
      retainLines: true,
    };
    return babel.transform(src, options).code;
  },

  getCacheKey: createCacheKeyFunction([
    __filename,
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'fbjs',
      'package.json'
    ),
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'fbjs-scripts',
      'package.json'
    ),
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'babel-preset-fbjs',
      'package.json'
    ),
    path.join(
      __dirname,
      '..',
      'module-map.js'
    ),
  ]),
};
