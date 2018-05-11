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

const EditorState = require('EditorState');

const expandRangeToStartOfLine = require('expandRangeToStartOfLine');
const getDraftEditorSelectionWithNodes = require('getDraftEditorSelectionWithNodes');
const moveSelectionBackward = require('moveSelectionBackward');
const removeTextWithStrategy = require('removeTextWithStrategy');

function keyCommandBackspaceToStartOfLine(
  editorState: EditorState,
): EditorState {
  const afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      const selection = strategyState.getSelection();
      if (selection.isCollapsed() && selection.getAnchorOffset() === 0) {
        return moveSelectionBackward(strategyState, 1);
      }

      const domSelection = global.getSelection();
      let range = domSelection.getRangeAt(0);
      range = expandRangeToStartOfLine(range);

      return getDraftEditorSelectionWithNodes(
        strategyState,
        null,
        range.endContainer,
        range.endOffset,
        range.startContainer,
        range.startOffset,
      ).selectionState;
    },
    'backward',
  );

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

module.exports = keyCommandBackspaceToStartOfLine;
