/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const applyEntityToContentBlock = require('applyEntityToContentBlock');
const Immutable = require('immutable');

function applyEntityToContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: ?string,
): ContentState {
  const blockMap = contentState.getBlockMap();
  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();

  const newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .toOrderedMap()
    .merge(Immutable.OrderedMap([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      const sliceStart = blockKey === startKey ? startOffset : 0;
      const sliceEnd = blockKey === endKey ? endOffset : block.getLength();
      return applyEntityToContentBlock(block, sliceStart, sliceEnd, entityKey);
    });

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = applyEntityToContentState;
