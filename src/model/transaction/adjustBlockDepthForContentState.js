/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const invariant = require('invariant');

function adjustBlockDepthForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  adjustment: number,
  maxDepth?: number,
): ContentState {
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  const endBlock = blockMap.get(endKey);
  invariant(endBlock != null, 'selection end must exist in block map');

  const newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, endBlock]])
    .map(block => {
      let depth = block.getDepth() + adjustment;
      depth = Math.max(0, depth);
      if (maxDepth != null) {
        depth = Math.min(depth, maxDepth);
      }
      return block.set('depth', depth);
    });

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = adjustBlockDepthForContentState;
