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
 * @flow
 */

'use strict';

var DraftEntitySegments = require('DraftEntitySegments');

var getRangesForDraftEntity = require('getRangesForDraftEntity');
var invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type SelectionState from 'SelectionState';
import type {EntityMap} from 'EntityMap';

/**
 * Given a SelectionState and a removal direction, determine the entire range
 * that should be removed from a ContentState. This is based on any entities
 * within the target, with their `mutability` values taken into account.
 *
 * For instance, if we are attempting to remove part of an "immutable" entity
 * range, the entire entity must be removed. The returned `SelectionState`
 * will be adjusted accordingly.
 */
function getCharacterRemovalRange(
  entityMap: EntityMap,
  startBlock: ContentBlock,
  endBlock: ContentBlock,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var startEntityKey = startBlock.getEntityAt(start);
  var endEntityKey = endBlock.getEntityAt(end - 1);
  if (!startEntityKey && !endEntityKey) {
    return selectionState;
  }
  var newSelectionState = selectionState;
  if (selectionState.getIsBackward()) {
    newSelectionState = selectionState.merge({
      anchorKey: selectionState.getFocusKey(),
      anchorOffset: selectionState.getFocusOffset(),
      focusKey: selectionState.getAnchorKey(),
      focusOffset: selectionState.getAnchorOffset(),
      isBackward: false,
    });
  }
  if (startEntityKey && (startEntityKey === endEntityKey)) {
    newSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
    );
  } else if (startEntityKey && endEntityKey) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
    );
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntityKey,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getAnchorOffset(),
      focusOffset: endSelectionState.getFocusOffset(),
      isBackward: false,
    });
  } else if (startEntityKey) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getStartOffset(),
      isBackward: false,
    });
  } else if (endEntityKey) {
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntityKey,
    );
    newSelectionState = newSelectionState.merge({
      focusOffset: endSelectionState.getEndOffset(),
      isBackward: false,
    });
  }
  return newSelectionState;
}

function getEntityRemovalRange(
  entityMap: EntityMap,
  block: ContentBlock,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
  entityKey: string,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var entity = entityMap.__get(entityKey);
  var mutability = entity.getMutability();

  // `MUTABLE` entities can just have the specified range of text removed
  // directly. No adjustments are needed.
  if (mutability === 'MUTABLE') {
    return selectionState;
  }

  // Find the entity range that overlaps with our removal range.
  var entityRanges = getRangesForDraftEntity(block, entityKey).filter(
    (range) => start < range.end && end > range.start,
  );

  invariant(
    entityRanges.length == 1,
    'There should only be one entity range within this removal range.',
  );

  var entityRange = entityRanges[0];

  // For `IMMUTABLE` entity types, we will remove the entire entity range.
  if (mutability === 'IMMUTABLE') {
    return selectionState.merge({
      anchorOffset: entityRange.start,
      focusOffset: entityRange.end,
      isBackward: false,
    });
  }

  // For `SEGMENTED` entity types, determine the appropriate segment to
  // remove.
  var removalRange = DraftEntitySegments.getRemovalRange(
    start,
    end,
    block.getText().slice(entityRange.start, entityRange.end),
    entityRange.start,
    direction,
  );

  return selectionState.merge({
    anchorOffset: removalRange.start,
    focusOffset: removalRange.end,
    isBackward: false,
  });
}

module.exports = getCharacterRemovalRange;
