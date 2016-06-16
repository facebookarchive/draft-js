/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule insertBlockBeforeInContentState
 * @typechecks
 * @flow
 */

'use strict';

var generateRandomKey = require('generateRandomKey');
var invariant = require('invariant');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function insertBlockBeforeInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  contentBlock: ContentBlock
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    'Selection range must be collapsed.'
  );

  var key = selectionState.getAnchorKey();
  var offset = selectionState.getAnchorOffset();
  var blockMap = contentState.getBlockMap();
  var firstBlockAfterNewBlock = blockMap.get(key);
  var blocksBefore = blockMap.toSeq().takeUntil(v => v === firstBlockAfterNewBlock);
  var blocksAfter = blockMap.toSeq().skipUntil(v => v === firstBlockAfterNewBlock);
  var newBlocks = blocksBefore.concat(
      [[contentBlock.getKey(), contentBlock]],
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

module.exports = insertBlockBeforeInContentState;
