/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findAncestorOffsetKey
 * @typechecks
 * @flow
 */

'use strict';

var getSelectionOffsetKeyForNode = require('getSelectionOffsetKeyForNode');

/**
 * Get the key from the node's nearest offset-aware ancestor.
 */
function findAncestorOffsetKey(node: Node): ?string {
  while (node && node !== document.documentElement) {
    var key = getSelectionOffsetKeyForNode(node);
    if (key != null) {
      return key;
    }
    node = node.parentNode;
  }
  return null;
}

module.exports = findAncestorOffsetKey;
