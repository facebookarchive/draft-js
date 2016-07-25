/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule moveBlockInContentState
 * @typechecks
 * @flow
 */

'use strict';

const invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type {DraftInsertionType} from 'DraftInsertionType';

function moveBlockInContentState(
  contentState: ContentState,
  blockToBeMoved: ContentBlock,
  targetBlock: ContentBlock,
  insertionMode: DraftInsertionType
): ContentState {
  invariant(
    blockToBeMoved.getKey() !== targetBlock.getKey(),
    'Block cannot be moved next to itself.'
  );

  invariant(
    insertionMode !== 'replace',
    'Replacing blocks is not supported.'
  );

  const targetKey = targetBlock.getKey();
  const blockBefore = contentState.getBlockBefore(targetKey);
  const blockAfter = contentState.getBlockAfter(targetKey);

  const blockMap = contentState.getBlockMap();
  const blockMapWithoutBlockToBeMoved = blockMap.delete(blockToBeMoved.getKey());
  const blocksBefore = blockMapWithoutBlockToBeMoved.toSeq().takeUntil(v => v === targetBlock);
  const blocksAfter = blockMapWithoutBlockToBeMoved.toSeq().skipUntil(v => v === targetBlock).skip(1);

  let newBlocks;

  if (insertionMode === 'before') {
    invariant(
      (!blockBefore) || blockBefore.getKey() !== blockToBeMoved.getKey(),
      'Block cannot be moved next to itself.'
    );

    newBlocks = blocksBefore.concat(
      [[blockToBeMoved.getKey(), blockToBeMoved], [targetBlock.getKey(), targetBlock]],
      blocksAfter
    ).toOrderedMap();
  } else if (insertionMode === 'after') {
    invariant(
      (!blockAfter) || blockAfter.getKey() !== blockToBeMoved.getKey(),
      'Block cannot be moved next to itself.'
    );

    newBlocks = blocksBefore.concat(
      [[targetBlock.getKey(), targetBlock], [blockToBeMoved.getKey(), blockToBeMoved]],
      blocksAfter
    ).toOrderedMap();
  }

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: contentState.getSelectionAfter().merge({
      anchorKey: blockToBeMoved.getKey(),
      focusKey: blockToBeMoved.getKey(),
    }),
  });
}

module.exports = moveBlockInContentState;
