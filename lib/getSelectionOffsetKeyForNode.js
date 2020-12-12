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
'use strict';
/**
 * Get offset key from a node or it's child nodes. Return the first offset key
 * found on the DOM tree of given node.
 */

var isElement = require("./isElement");

function getSelectionOffsetKeyForNode(node) {
  if (isElement(node)) {
    var castedNode = node;
    var offsetKey = castedNode.getAttribute('data-offset-key');

    if (offsetKey) {
      return offsetKey;
    }

    for (var ii = 0; ii < castedNode.childNodes.length; ii++) {
      var childOffsetKey = getSelectionOffsetKeyForNode(castedNode.childNodes[ii]);

      if (childOffsetKey) {
        return childOffsetKey;
      }
    }
  }

  return null;
}

module.exports = getSelectionOffsetKeyForNode;