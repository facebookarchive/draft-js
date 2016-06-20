/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSelectionOffsetKeyForNode
 * @typechecks
 * @flow
 */

'use strict';

/**
 * Get offset key from a node.
 */
function getSelectionOffsetKeyForNode(node: Node): ?string {
  if (node instanceof Element) {
    var offsetKey = node.getAttribute('data-offset-key');
    if (offsetKey) return offsetKey;
    for (var ii = 0; ii < node.children.length; ii++) {
      var childOffsetKey = getSelectionOffsetKeyForNode(node.children[ii]);
      if (childOffsetKey) return childOffsetKey;
    }
  }
  return null;
}

module.exports = getSelectionOffsetKeyForNode;
