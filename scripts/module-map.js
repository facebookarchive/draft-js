/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = Object.assign(
  {
    immutable: 'immutable',
    React: 'react',
    ReactDOM: 'react-dom',
    'object-assign': 'object-assign',

    ReactTestUtils: 'react-dom/lib/ReactTestUtils',
    reactComponentExpect: 'react-dom/lib/reactComponentExpect',
  },
  require('fbjs/module-map'),
  require('fbjs-scripts/third-party-module-map')
);
