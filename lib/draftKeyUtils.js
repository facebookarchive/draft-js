/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Provides utilities for handling draftjs keys.
 *
 * @emails oncall+draft_js
 * 
 * @format
 */
'use strict';

function notEmptyKey(key) {
  return key != null && key != '';
}

module.exports = {
  notEmptyKey: notEmptyKey
};