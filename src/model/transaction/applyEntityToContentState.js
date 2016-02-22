/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule applyEntityToContentState
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');

var applyEntityToContentBlock = require('applyEntityToContentBlock');

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function applyEntityToContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  entityKey: ?string
): ContentState {
  var blockMap = contentState.getBlockMap();
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();

  var newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .toOrderedMap()
    .merge(Immutable.OrderedMap([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      var sliceStart;
      var sliceEnd;

      if (startKey === endKey) {
        sliceStart = startOffset;
        sliceEnd = endOffset;
      } else {
        sliceStart = blockKey === startKey ? startOffset : 0;
        sliceEnd = blockKey === endKey ? 0 : block.getLength();
      }

      return applyEntityToContentBlock(
        block,
        sliceStart,
        sliceEnd,
        entityKey
      );
    });

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = applyEntityToContentState;
