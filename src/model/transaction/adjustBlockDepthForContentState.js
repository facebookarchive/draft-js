/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function adjustBlockDepthForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  adjustment: number,
  maxDepth: number,
): ContentState {
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  let blockMap = contentState.getBlockMap();
  const blocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]])
    .map(block => {
      let depth = block.getDepth() + adjustment;
      depth = Math.max(0, Math.min(depth, maxDepth));
      return block.set('depth', depth);
    });

  blockMap = blockMap.merge(blocks);

  return contentState.merge({
    blockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = adjustBlockDepthForContentState;
