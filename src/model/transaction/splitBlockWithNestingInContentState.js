/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule splitBlockWithNestingInContentState
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');
var generateNestedKey = require('generateNestedKey');
var invariant = require('invariant');
var ContentBlock = require('ContentBlock');

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

var {
  List
} = Immutable;

/*
  Split a block and create a new nested block,

  If block has no nested blocks, original text from the block is split
  between 2 nested blocks

  LI "Hello World"   -->   LI ""
                            UNSTYLED "Hello"
                            UNSTYLED " World"
*/
function splitBlockWithNestingInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  blockType:string='unstyled'
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    'Selection range must be collapsed.'
  );

  var key = selectionState.getAnchorKey();
  var offset = selectionState.getAnchorOffset();
  var blockMap = contentState.getBlockMap();
  var blockToSplit = blockMap.get(key);

  var text = blockToSplit.getText();
  var chars = blockToSplit.getCharacterList();

  var firstNestedKey = generateNestedKey(key);
  var secondNestedKey = generateNestedKey(key);

  var newParentBlock = blockToSplit.merge({
    text: '',
    characterList: List()
  });

  var firstNestedBlock = new ContentBlock({
    key: firstNestedKey,
    type: blockType,
    text: text.slice(0, offset),
    characterList: chars.slice(0, offset)
  });

  var secondNestedBlock = new ContentBlock({
    key: secondNestedKey,
    type: blockType,
    text: text.slice(offset),
    characterList: chars.slice(offset)
  });

  var blocksBefore = blockMap.toSeq().takeUntil(v => v === blockToSplit);
  var blocksAfter = blockMap.toSeq().skipUntil(v => v === blockToSplit).rest();
  var newBlocks = blocksBefore.concat(
      [[newParentBlock.getKey(), newParentBlock],
        [firstNestedBlock.getKey(), firstNestedBlock],
        [secondNestedBlock.getKey(), secondNestedBlock]],
      blocksAfter
    ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: secondNestedKey,
      anchorOffset: 0,
      focusKey: secondNestedKey,
      focusOffset: 0,
      isBackward: false,
    }),
  });
}

module.exports = splitBlockWithNestingInContentState;
