/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setBlockTypeForContentState
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type SelectionState from 'SelectionState';

function setBlockTypeForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  blockType: DraftBlockType,
): ContentState {
  var startKey = selectionState.getStartKey();
  var endKey = selectionState.getEndKey();
  var blockMap = contentState.getBlockMap();
  var newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Immutable.Map([[endKey, blockMap.get(endKey)]]))
    .map(block => block.merge({type: blockType, depth: 0}));

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = setBlockTypeForContentState;
