/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = Object.assign(
  {
    immutable: 'immutable',
    React: 'react',
    react: 'react',
    ReactDOM: 'react-dom',
    'react-dom': 'react-dom',
    ReactDOMComet: 'react-dom',
    'object-assign': 'object-assign',

    ReactTestUtils: 'react-dom/lib/ReactTestUtils',
    reactComponentExpect: 'react-dom/lib/reactComponentExpect',
  },
  require('fbjs/module-map'),
  require('fbjs-scripts/third-party-module-map'),
);
