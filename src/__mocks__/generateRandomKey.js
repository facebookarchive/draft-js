/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

let count = 0;

function generateRandomKey() {
  return `key${count++}`;
}

module.exports = generateRandomKey;
