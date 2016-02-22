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
  return node instanceof Element ? node.getAttribute('data-offset-key') : null;
}

module.exports = getSelectionOffsetKeyForNode;
