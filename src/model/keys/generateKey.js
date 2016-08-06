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

let x = 0;
const MOD = Math.pow(2, 36);
function generateKey(): string {
  return 'k' + (x++ % MOD).toString(36)
}

module.exports = generateKey;
