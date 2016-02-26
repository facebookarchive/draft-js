/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var assign = require('object-assign');
var babelPluginModules = require('fbjs-scripts/babel/rewrite-modules');

module.exports = {
  blacklist: [
    'es6.regex.unicode',
  ],
  nonStandard: true,
  optional: [
    'es7.trailingFunctionCommas',
    'es7.classProperties',
  ],
  stage: 1,
  plugins: [babelPluginModules],
  _moduleMap: assign({}, require('fbjs/module-map'), {
    immutable: 'immutable',
    React: 'react',
    ReactDOM: 'react-dom',
  }),
};
