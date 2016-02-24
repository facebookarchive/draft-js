/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule removeEntitiesAtEdges
 * @flow
 */

'use strict';

const CharacterMetadata = require('CharacterMetadata');
const DraftEntity = require('DraftEntity');

const findRangesImmutable = require('findRangesImmutable');
const invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type {List} from 'immutable';
import type SelectionState from 'SelectionState';

function removeEntitiesAtEdges(
  contentState: ContentState,
  selectionState: SelectionState
): ContentState {
  const blockMap = contentState.getBlockMap();

  const updatedBlocks = {};

  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const startBlock = blockMap.get(startKey);
  const updatedStart = removeForBlock(startBlock, startOffset);

  if (updatedStart !== startBlock) {
    updatedBlocks[startKey] = updatedStart;
  }

  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();
  let endBlock = blockMap.get(endKey);
  if (startKey === endKey) {
    endBlock = updatedStart;
  }

  const updatedEnd = removeForBlock(endBlock, endOffset);

  if (updatedEnd !== endBlock) {
    updatedBlocks[endKey] = updatedEnd;
  }

  if (!Object.keys(updatedBlocks).length) {
    return contentState.set('selectionAfter', selectionState);
  }

  return contentState.merge({
    blockMap: blockMap.merge(updatedBlocks),
    selectionAfter: selectionState,
  });
}

function getRemovalRange(
  characters: List<CharacterMetadata>,
  key: ?string,
  offset: number
): Object {
  let removalRange;
  findRangesImmutable(
    characters,
    (a, b) => a.getEntity() === b.getEntity(),
    element => element.getEntity() === key,
    (start, end) => {
      if (start <= offset && end >= offset) {
        removalRange = {start, end};
      }
    }
  );
  invariant(
    typeof removalRange === 'object',
    'Removal range must exist within character list.'
  );
  return removalRange;
}

function removeForBlock(
  block: ContentBlock,
  offset: number
): ContentBlock {
  let chars = block.getCharacterList();
  const charBefore = offset > 0 ? chars.get(offset - 1) : undefined;
  const charAfter = offset < chars.count() ? chars.get(offset) : undefined;
  const entityBeforeCursor = charBefore ? charBefore.getEntity() : undefined;
  const entityAfterCursor = charAfter ? charAfter.getEntity() : undefined;

  if (entityAfterCursor && entityAfterCursor === entityBeforeCursor) {
    const entity = DraftEntity.get(entityAfterCursor);
    if (entity.getMutability() !== 'MUTABLE') {
      const range = getRemovalRange(chars, entityAfterCursor, offset);
      const {end} = range;
      let {start} = range;
      let current;
      while (start < end) {
        current = chars.get(start);
        chars = chars.set(start, CharacterMetadata.applyEntity(current, null));
        start++;
      }
      return block.set('characterList', chars);
    }
  }

  return block;
}

module.exports = removeEntitiesAtEdges;
