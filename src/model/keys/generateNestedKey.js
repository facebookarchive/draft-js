/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateNestedKey
 * @typechecks
 * @flow
 */

'use strict';

var generateRandomKey = require('generateRandomKey');

function generateNestedKey(
  parentKey: string,
  childKey: ?string
): string {
  childKey = childKey || generateRandomKey();
  return parentKey + '/' + childKey;
}

module.exports = generateNestedKey;
