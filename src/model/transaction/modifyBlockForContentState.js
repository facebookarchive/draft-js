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

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const Immutable = require('immutable');

const {Map} = Immutable;

function modifyBlockForContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  operation: (block: BlockNodeRecord) => BlockNodeRecord,
): ContentState {
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  const newBlocks = blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, blockMap.get(endKey)]]))
    .map(operation);

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = modifyBlockForContentState;
