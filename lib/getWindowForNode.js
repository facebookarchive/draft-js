"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
function getWindowForNode(node) {
  if (!node || !node.ownerDocument || !node.ownerDocument.defaultView) {
    return window;
  }

  return node.ownerDocument.defaultView;
}

module.exports = getWindowForNode;