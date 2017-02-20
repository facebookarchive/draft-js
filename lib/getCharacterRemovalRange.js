/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getCharacterRemovalRange
 * @typechecks
 * 
 */

'use strict';

var DraftEntitySegments = require('./DraftEntitySegments');

var getRangesForDraftEntity = require('./getRangesForDraftEntity');
var invariant = require('fbjs/lib/invariant');

/**
 * Given a SelectionState and a removal direction, determine the entire range
 * that should be removed from a ContentState. This is based on any entities
 * within the target, with their `mutability` values taken into account.
 *
 * For instance, if we are attempting to remove part of an "immutable" entity
 * range, the entire entity must be removed. The returned `SelectionState`
 * will be adjusted accordingly.
 */
function getCharacterRemovalRange(entityMap, block, selectionState, direction) {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var entityKey = block.getEntityAt(start);
  if (!entityKey) {
    return selectionState;
  }

  var entity = entityMap.__get(entityKey);
  var mutability = entity.getMutability();

  // `MUTABLE` entities can just have the specified range of text removed
  // directly. No adjustments are needed.
  if (mutability === 'MUTABLE') {
    return selectionState;
  }

  // Find the entity range that overlaps with our removal range.
  var entityRanges = getRangesForDraftEntity(block, entityKey).filter(function (range) {
    return start < range.end && end > range.start;
  });

  !(entityRanges.length == 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'There should only be one entity range within this removal range.') : invariant(false) : void 0;

  var entityRange = entityRanges[0];

  // For `IMMUTABLE` entity types, we will remove the entire entity range.
  if (mutability === 'IMMUTABLE') {
    return selectionState.merge({
      anchorOffset: entityRange.start,
      focusOffset: entityRange.end,
      isBackward: false
    });
  }

  // For `SEGMENTED` entity types, determine the appropriate segment to
  // remove.
  var removalRange = DraftEntitySegments.getRemovalRange(start, end, block.getText().slice(entityRange.start, entityRange.end), entityRange.start, direction);

  return selectionState.merge({
    anchorOffset: removalRange.start,
    focusOffset: removalRange.end,
    isBackward: false
  });
}

module.exports = getCharacterRemovalRange;