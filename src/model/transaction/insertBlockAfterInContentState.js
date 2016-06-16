/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule insertBlockAfterInContentState
 * @typechecks
 * @flow
 */

'use strict';

var invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function insertBlockAfterInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  contentBlock: ContentBlock
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    'Selection range must be collapsed.'
  );

  var key = selectionState.getAnchorKey();
  var blockMap = contentState.getBlockMap();
  var lastBlockBeforeNewBlock = blockMap.get(key);
  var blocksBefore = blockMap.toSeq().takeUntil(v => v === lastBlockBeforeNewBlock);
  var blocksAfter = blockMap.toSeq().skipUntil(v => v === lastBlockBeforeNewBlock).rest();
  var newBlocks = blocksBefore.concat(
      [[lastBlockBeforeNewBlock.getKey(), lastBlockBeforeNewBlock], [contentBlock.getKey(), contentBlock]],
      blocksAfter
    ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: contentBlock.getKey(),
      anchorOffset: 0,
      focusKey: contentBlock.getKey(),
      focusOffset: 0,
      isBackward: false,
    }),
  });
}

module.exports = insertBlockAfterInContentState;
