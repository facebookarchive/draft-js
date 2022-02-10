/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

import type {SelectionObject} from 'DraftDOMTypes';

const EditorState = require('EditorState');

const expandRangeToStartOfLine = require('expandRangeToStartOfLine');
const getDraftEditorSelectionWithNodes = require('getDraftEditorSelectionWithNodes');
const moveSelectionBackward = require('moveSelectionBackward');
const removeTextWithStrategy = require('removeTextWithStrategy');

function keyCommandBackspaceToStartOfLine(
  editorState: EditorState,
  e: SyntheticKeyboardEvent<HTMLElement>,
): EditorState {
  const afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      const selection = strategyState.getSelection();
      if (selection.isCollapsed() && selection.getAnchorOffset() === 0) {
        return moveSelectionBackward(strategyState, 1);
      }
      const {ownerDocument} = e.currentTarget;
      const domSelection: SelectionObject =
        ownerDocument.defaultView.getSelection();
      // getRangeAt can technically throw if there's no selection, but we know
      // there is one here because text editor has focus (the cursor is a
      // selection of length 0). Therefore, we don't need to wrap this in a
      // try-catch block.
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
