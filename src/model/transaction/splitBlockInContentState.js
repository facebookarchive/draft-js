/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule splitBlockInContentState
 * @typechecks
 * @flow
 */

'use strict';

const generateBlockKey = require('generateBlockKey');
const invariant = require('invariant');

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function splitBlockInContentState(
  contentState: ContentState,
  selectionState: SelectionState
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    'Selection range must be collapsed.'
  );

  const key = selectionState.getAnchorKey();
  const offset = selectionState.getAnchorOffset();
  const blockMap = contentState.getBlockMap();
  const blockToSplit = blockMap.get(key);

  const text = blockToSplit.getText();
  const chars = blockToSplit.getCharacterList();

  const blockAbove = blockToSplit.merge({
    text: text.slice(0, offset),
    characterList: chars.slice(0, offset),
  });

  const keyBelow = generateBlockKey();
  const blockBelow = blockAbove.merge({
    key: keyBelow,
    text: text.slice(offset),
    characterList: chars.slice(offset),
  });

  const blocksBefore = blockMap.toSeq().takeUntil(v => v === blockToSplit);
  const blocksAfter = blockMap.toSeq().skipUntil(v => v === blockToSplit).rest();
  const newBlocks = blocksBefore.concat(
      [[blockAbove.getKey(), blockAbove], [blockBelow.getKey(), blockBelow]],
      blocksAfter
    ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: keyBelow,
      anchorOffset: 0,
      focusKey: keyBelow,
      focusOffset: 0,
      isBackward: false,
    }),
  });
}

module.exports = splitBlockInContentState;
