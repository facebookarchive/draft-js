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
function getCorrectDocumentFromNode(node) {
  if (!node || !node.ownerDocument) {
    return document;
  }

  return node.ownerDocument;
}

module.exports = getCorrectDocumentFromNode;