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

const CharacterMetadata = require('CharacterMetadata');
const {Map} = require('immutable');

const ContentStateInlineStyle = {
  add: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return modifyInlineStyle(contentState, selectionState, inlineStyle, true);
  },

  remove: function(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
  ): ContentState {
    return modifyInlineStyle(contentState, selectionState, inlineStyle, false);
  },
};

function modifyInlineStyle(
  contentState: ContentState,
  selectionState: SelectionState,
  inlineStyle: string,
  addOrRemove: boolean,
): ContentState {
  const blockMap = contentState.getBlockMap();
  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();

  const newBlocks = blockMap
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat(Map([[endKey, blockMap.get(endKey)]]))
    .map((block, blockKey) => {
      let sliceStart;
      let sliceEnd;

      if (startKey === endKey) {
        sliceStart = startOffset;
        sliceEnd = endOffset;
      } else {
        sliceStart = blockKey === startKey ? startOffset : 0;
        sliceEnd = blockKey === endKey ? endOffset : block.getLength();
      }

      let chars = block.getCharacterList();
      let current;
      while (sliceStart < sliceEnd) {
        current = chars.get(sliceStart);
        chars = chars.set(
          sliceStart,
          addOrRemove
            ? CharacterMetadata.applyStyle(current, inlineStyle)
            : CharacterMetadata.removeStyle(current, inlineStyle),
        );
        sliceStart++;
      }

      return block.set('characterList', chars);
    });

  return contentState.merge({
    blockMap: blockMap.merge(newBlocks),
    selectionBefore: selectionState,
    selectionAfter: selectionState,
  });
}

module.exports = ContentStateInlineStyle;
