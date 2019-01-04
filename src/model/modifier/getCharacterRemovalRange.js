/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';

const DraftEntitySegments = require('DraftEntitySegments');

const getRangesForDraftEntity = require('getRangesForDraftEntity');
const invariant = require('invariant');

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
  const start = selectionState.getStartOffset();
  const end = selectionState.getEndOffset();
  const startEntityKey = startBlock.getEntityAt(start);
  const endEntityKey = endBlock.getEntityAt(end - 1);
  if (!startEntityKey && !endEntityKey) {
    return selectionState;
  }
  let newSelectionState = selectionState;
  if (startEntityKey && startEntityKey === endEntityKey) {
    newSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
      true,
      true,
    );
  } else if (startEntityKey && endEntityKey) {
    const startSelectionState = getEntityRemovalRange(
      entityMap,
      startBlock,
      newSelectionState,
      direction,
      startEntityKey,
      false,
      true,
    );
    const endSelectionState = getEntityRemovalRange(
      entityMap,
      endBlock,
      newSelectionState,
      direction,
      endEntityKey,
      false,
      false,
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
      false,
      true,
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
  entityKey: string,
  isEntireSelectionWithinEntity: boolean,
  isEntityAtStart: boolean,
): SelectionState {
  let start = selectionState.getStartOffset();
  let end = selectionState.getEndOffset();
  const entity = entityMap.__get(entityKey);
  const mutability = entity.getMutability();
  const sideToConsider = isEntityAtStart ? start : end;

  // `MUTABLE` entities can just have the specified range of text removed
  // directly. No adjustments are needed.
  if (mutability === 'MUTABLE') {
    return selectionState;
  }

  // Find the entity range that overlaps with our removal range.
  const entityRanges = getRangesForDraftEntity(block, entityKey).filter(
    range => sideToConsider <= range.end && sideToConsider >= range.start,
  );

  invariant(
    entityRanges.length == 1,
    'There should only be one entity range within this removal range.',
  );

  const entityRange = entityRanges[0];

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
  if (!isEntireSelectionWithinEntity) {
    if (isEntityAtStart) {
      end = entityRange.end;
    } else {
      start = entityRange.start;
    }
  }

  const removalRange = DraftEntitySegments.getRemovalRange(
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
