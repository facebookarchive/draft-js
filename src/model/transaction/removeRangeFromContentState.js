/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule removeRangeFromContentState
 * @flow
 */

'use strict';

const Immutable = require('immutable');

import type CharacterMetadata from 'CharacterMetadata';
import type ContentState from 'ContentState';
import type {List} from 'immutable';
import type SelectionState from 'SelectionState';

function removeRangeFromContentState(
  contentState: ContentState,
  selectionState: SelectionState
): ContentState {
  if (selectionState.isCollapsed()) {
    return contentState;
  }

  let blockMap = contentState.getBlockMap();
  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();

  const startBlock = blockMap.get(startKey);
  const endBlock = blockMap.get(endKey);
  let characterList;

  if (startBlock === endBlock) {
    characterList = removeFromList(
      startBlock.getCharacterList(),
      startOffset,
      endOffset
    );
  } else {
    characterList = startBlock
      .getCharacterList()
      .slice(0, startOffset)
      .concat(endBlock.getCharacterList().slice(endOffset));
  }

  const modifiedStart = startBlock.merge({
    text: (
      startBlock.getText().slice(0, startOffset) +
      endBlock.getText().slice(endOffset)
    ),
    characterList,
  });

  const newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Immutable.Map([[endKey, null]]))
    .map((_, k) => { return k === startKey ? modifiedStart : null; });

  blockMap = blockMap.merge(newBlocks).filter(block => !!block);

  return contentState.merge({
    blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset,
      isBackward: false,
    }),
  });
}

/**
 * Maintain persistence for target list when removing characters on the
 * head and tail of the character list.
 */
function removeFromList(
  targetList: List<CharacterMetadata>,
  startOffset: number,
  endOffset: number
): List<CharacterMetadata> {
  if (startOffset === 0) {
    while (startOffset < endOffset) {
      targetList = targetList.shift();
      startOffset++;
    }
  } else if (endOffset === targetList.count()) {
    while (endOffset > startOffset) {
      targetList = targetList.pop();
      endOffset--;
    }
  } else {
    const head = targetList.slice(0, startOffset);
    const tail = targetList.slice(endOffset);
    targetList = head.concat(tail).toList();
  }
  return targetList;
}

module.exports = removeRangeFromContentState;
