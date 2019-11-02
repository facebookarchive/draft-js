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

'use strict';

const React = require('React');

export type DraftBlockRenderConfig = {
  element: string,
  wrapper?: React.Node,
  aliasedElements?: Array<string>,
};
