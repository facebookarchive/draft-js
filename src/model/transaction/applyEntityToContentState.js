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

const applyEntityToContentBlock = require('applyEntityToContentBlock');
const {OrderedMap} = require('immutable');
const invariant = require('invariant');

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
  const endBlock = blockMap.get(endKey);
  invariant(endBlock != null, 'selection end must exist in block map');

  const newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .toOrderedMap()
    .merge(OrderedMap([[endKey, endBlock]]))
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
