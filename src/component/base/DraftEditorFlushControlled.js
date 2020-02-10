/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

const ReactDOM = require('ReactDOM');

const flushControlled: void | ((fn: () => void) => void) =
  // $FlowExpectedError unstable_flushControlled is not yet in the upstream Flow typing
  ReactDOM.unstable_flushControlled;

module.exports = flushControlled;
