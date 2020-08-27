/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import getCorrectDocumentFromNode from 'getCorrectDocumentFromNode';
import getSelectionOffsetKeyForNode from 'getSelectionOffsetKeyForNode';
/**
 * Get the key from the node's nearest offset-aware ancestor.
 */
export default function findAncestorOffsetKey(node: Node): ?string {
  let searchNode = node;
  while (
    searchNode &&
    searchNode !== getCorrectDocumentFromNode(node).documentElement
  ) {
    const key = getSelectionOffsetKeyForNode(searchNode);
    if (key != null) {
      return key;
    }
    searchNode = searchNode.parentNode;
  }
  return null;
}
