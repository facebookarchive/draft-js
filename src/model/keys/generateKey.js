/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateKey
 * @typechecks
 * @flow
 */

'use strict';

let lastKey = 0;

function generateKey(): string {
  lastKey += 1;
  const str = lastKey.toString(16);
  return '00000'.slice(str.length) + str;
}

module.exports = generateKey;
