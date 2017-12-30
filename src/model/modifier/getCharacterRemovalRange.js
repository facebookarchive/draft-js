/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getCharacterRemovalRange
 * @format
 * @flow
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';
import type {DraftEntitySet} from 'DraftEntitySet';

var DraftEntitySegments = require('DraftEntitySegments');

var getRangesForDraftEntity = require('getRangesForDraftEntity');
var invariant = require('invariant');

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
  startBlock: BlockNodeRecord,
  endBlock: BlockNodeRecord,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();
  var startEntities = startBlock.getEntityAt(start);
  var endEntities = endBlock.getEntityAt(end - 1);
  if (startEntities.size == 0 && endEntities.size == 0) {
    return selectionState;
  }
  var newSelectionState = selectionState;
  if (startEntities.size > 0 && startEntities.intersect(endEntities).size > 0) {
    newSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntities,
      true,
      true,
    );
  } else if (startEntities.size > 0 && endEntities.size > 0) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntities,
      false,
      true,
    );
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntities,
      false,
      false,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getAnchorOffset(),
      focusOffset: endSelectionState.getFocusOffset(),
      isBackward: false,
    });
  } else if (startEntities.size > 0) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntities,
      false,
      true,
    );
    newSelectionState = newSelectionState.merge({
      anchorOffset: startSelectionState.getStartOffset(),
      isBackward: false,
    });
  } else if (endEntities.size > 0) {
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntities,
      false,
      false,
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
  block: BlockNodeRecord,
  selectionState: SelectionState,
  direction: DraftRemovalDirection,
  entities: DraftEntitySet,
  isEntireSelectionWithinEntity: boolean,
  isEntityAtStart: boolean,
): SelectionState {
  var start = selectionState.getStartOffset();
  var end = selectionState.getEndOffset();

  entities.forEach(entityKey => {
    var entity = entityMap.get(entityKey);
    var mutability = entity.getMutability();

    // `MUTABLE` entities can just have the specified range of text removed
    // directly. No adjustments are needed.
    if (mutability === 'MUTABLE') {
      return;
    }

    const sideToConsider = isEntityAtStart ? start : end;

    // Find the entity range that overlaps with our removal range.
    var entityRanges = getRangesForDraftEntity(block, entityKey).filter(
      range => sideToConsider <= range.end && sideToConsider >= range.start,
    );

    invariant(
      entityRanges.length == 1,
      'There should only be one entity range within this removal range.',
    );

    var entityRange = entityRanges[0];

    // For `IMMUTABLE` entity types, we will remove the entire entity range.
    if (mutability === 'IMMUTABLE') {
      selectionState = selectionState.merge({
        anchorOffset: Math.min(
          selectionState.getAnchorOffset(),
          entityRange.start,
        ),
        focusOffset: Math.max(selectionState.getFocusOffset(), entityRange.end),
        isBackward: false,
      });
      return;
    }

    // For `SEGMENTED` entity types, determine the appropriate segment to
    // remove.
    if (!isEntireSelectionWithinEntity) {
      if (isEntityAtStart) {
        end = entityRange.end;
      } else {
        start = entityRange.start;
      }
    }

    var removalRange = DraftEntitySegments.getRemovalRange(
      start,
      end,
      block.getText().slice(entityRange.start, entityRange.end),
      entityRange.start,
      direction,
    );

    selectionState = selectionState.merge({
      anchorOffset: Math.min(
        selectionState.getAnchorOffset(),
        removalRange.start,
      ),
      focusOffset: Math.max(selectionState.getFocusOffset(), removalRange.end),
      isBackward: false,
    });
  });

  return selectionState;
}

module.exports = getCharacterRemovalRange;
