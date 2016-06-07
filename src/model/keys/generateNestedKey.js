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

const generateRandomKey = require('generateRandomKey');

/*
 * Returns a nested key based on a parent key. If a child key is
 * supplied it will be used, otherwise a new random key will be
 * created.
 */
function generateNestedKey(
  parentKey: string,
  childKey: ?string
): string {
  const key = childKey || generateRandomKey();
  return parentKey + '/' + key;
}

module.exports = generateNestedKey;
