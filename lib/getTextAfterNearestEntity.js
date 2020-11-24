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
 * Find the string of text between the previous entity and the specified
 * offset. This allows us to narrow down search areas for regex matching.
 */
function getTextAfterNearestEntity(block, offset) {
  var start = offset; // Get start based on where the last entity ended.

  while (start > 0 && block.getEntityAt(start - 1) === null) {
    start--;
  }

  return block.getText().slice(start, offset);
}

module.exports = getTextAfterNearestEntity;