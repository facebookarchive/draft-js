/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const React = require('React');

export type DraftBlockRenderConfig = {
  element: string,
  wrapper?: React.Node,
  aliasedElements?: Array<string>,
};
