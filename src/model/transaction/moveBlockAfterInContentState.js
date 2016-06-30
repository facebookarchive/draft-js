/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule moveBlockAfterInContentState
 * @typechecks
 * @flow
 */

'use strict';

var invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function moveBlockAfterInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  contentBlock: ContentBlock
): ContentState {
  invariant(
    selectionState.getAnchorKey() === selectionState.getFocusKey(),
    'Selection range must be within same block.'
  );

  var key = selectionState.getAnchorKey();
  var blockMap = contentState.getBlockMap();
  var blockToBeMoved = blockMap.get(key);
  
  invariant(
    blockToBeMoved !== contentBlock,
    'Block cannot be moved next to itself.'
  );

  var blocksWithoutBlockToBeMoved = blockMap.delete(blockToBeMoved.getKey());
  var blocksBefore = blocksWithoutBlockToBeMoved.toSeq().takeUntil(v => v === contentBlock);
  var blocksAfter = blocksWithoutBlockToBeMoved.toSeq().skipUntil(v => v === contentBlock);
  var newBlocks = blocksBefore.concat(
      [[contentBlock.getKey(), contentBlock], [blockToBeMoved.getKey(), blockToBeMoved]],
      blocksAfter
    ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: blockToBeMoved.getKey(),
      anchorOffset: 0,
      focusKey: blockToBeMoved.getKey(),
      focusOffset: 0,
      isBackward: false,
    }),
  });
}

module.exports = moveBlockAfterInContentState;
