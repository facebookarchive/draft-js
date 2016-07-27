/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule adjustBlockDepthForContentState
 * @typechecks
 * 
 */

'use strict';

function adjustBlockDepthForContentState(contentState, selectionState, adjustment, maxDepth) {
  var startKey = selectionState.getStartKey();
  var endKey = selectionState.getEndKey();
  var blockMap = contentState.getBlockMap();
  var blocks = blockMap.toSeq().skipUntil(function (_, k) {
    return k === startKey;
  }).takeUntil(function (_, k) {
    return k === endKey;
  }).concat([[endKey, blockMap.get(endKey)]]).map(function (block) {
    var depth = block.getDepth() + adjustment;
    depth = Math.max(0, Math.min(depth, maxDepth));
    return block.set('depth', depth);
  });

  blockMap = blockMap.merge(blocks);

  return contentState.merge({
    blockMap: blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState
  });
}

module.exports = adjustBlockDepthForContentState;