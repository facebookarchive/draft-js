/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

function getCorrectDocumentFromNode(node: ?Node): Document {
  if (!node || !node.ownerDocument) {
    return document;
  }
  return node.ownerDocument;
}

module.exports = getCorrectDocumentFromNode;
