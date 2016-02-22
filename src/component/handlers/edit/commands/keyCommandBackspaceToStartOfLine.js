/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyCommandBackspaceToStartOfLine
 * @flow
 */

'use strict';

var EditorState = require('EditorState');

var expandRangeToStartOfLine = require('expandRangeToStartOfLine');
var getDraftEditorSelectionWithNodes = require('getDraftEditorSelectionWithNodes');
var removeTextWithStrategy = require('removeTextWithStrategy');

function keyCommandBackspaceToStartOfLine(
  editorState: EditorState
): EditorState {
  var afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      var domSelection = global.getSelection();
      var range = domSelection.getRangeAt(0);
      range = expandRangeToStartOfLine(range);

      var selection = getDraftEditorSelectionWithNodes(
        strategyState,
        null,
        range.endContainer,
        range.endOffset,
        range.startContainer,
        range.startOffset
      ).selectionState;
      return selection;
    },
    'backward'
  );

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(
    editorState,
    afterRemoval,
    'remove-range'
  );
}

module.exports = keyCommandBackspaceToStartOfLine;
