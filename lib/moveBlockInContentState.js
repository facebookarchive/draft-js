/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule moveBlockInContentState
 * @format
 * 
 */

'use strict';

var invariant = require('fbjs/lib/invariant');

function moveBlockInContentState(contentState, blockToBeMoved, targetBlock, insertionMode) {
  !(blockToBeMoved.getKey() !== targetBlock.getKey()) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;

  !(insertionMode !== 'replace') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Replacing blocks is not supported.') : invariant(false) : void 0;

  var targetKey = targetBlock.getKey();
  var blockBefore = contentState.getBlockBefore(targetKey);
  var blockAfter = contentState.getBlockAfter(targetKey);

  var blockMap = contentState.getBlockMap();
  var blockMapWithoutBlockToBeMoved = blockMap['delete'](blockToBeMoved.getKey());
  var blocksBefore = blockMapWithoutBlockToBeMoved.toSeq().takeUntil(function (v) {
    return v === targetBlock;
  });
  var blocksAfter = blockMapWithoutBlockToBeMoved.toSeq().skipUntil(function (v) {
    return v === targetBlock;
  }).skip(1);

  var newBlocks = void 0;

  if (insertionMode === 'before') {
    !(!blockBefore || blockBefore.getKey() !== blockToBeMoved.getKey()) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;

    newBlocks = blocksBefore.concat([[blockToBeMoved.getKey(), blockToBeMoved], [targetBlock.getKey(), targetBlock]], blocksAfter).toOrderedMap();
  } else if (insertionMode === 'after') {
    !(!blockAfter || blockAfter.getKey() !== blockToBeMoved.getKey()) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;

    newBlocks = blocksBefore.concat([[targetBlock.getKey(), targetBlock], [blockToBeMoved.getKey(), blockToBeMoved]], blocksAfter).toOrderedMap();
  }

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: contentState.getSelectionAfter().merge({
      anchorKey: blockToBeMoved.getKey(),
      focusKey: blockToBeMoved.getKey()
    })
  });
}

module.exports = moveBlockInContentState;