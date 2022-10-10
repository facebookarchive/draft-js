/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

const ReactDOMComet = require('ReactDOMComet');

const flushControlled: void | ((fn: () => void) => void) =
  ReactDOMComet.unstable_flushControlled;

module.exports = flushControlled;
