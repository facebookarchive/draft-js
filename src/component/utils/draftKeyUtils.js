/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Provides utilities for handling draftjs keys.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

function notEmptyKey(key: ?string): boolean %checks {
  return key != null && key != '';
}

module.exports = {
  notEmptyKey,
};
