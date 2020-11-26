/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var EditorState = require("./EditorState");

var expandRangeToStartOfLine = require("./expandRangeToStartOfLine");

var getDraftEditorSelectionWithNodes = require("./getDraftEditorSelectionWithNodes");

var moveSelectionBackward = require("./moveSelectionBackward");

var removeTextWithStrategy = require("./removeTextWithStrategy");

function keyCommandBackspaceToStartOfLine(editorState, e) {
  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
    var selection = strategyState.getSelection();

    if (selection.isCollapsed() && selection.getAnchorOffset() === 0) {
      return moveSelectionBackward(strategyState, 1);
    }

    var ownerDocument = e.currentTarget.ownerDocument;
    var domSelection = ownerDocument.defaultView.getSelection(); // getRangeAt can technically throw if there's no selection, but we know
    // there is one here because text editor has focus (the cursor is a
    // selection of length 0). Therefore, we don't need to wrap this in a
    // try-catch block.

    var range = domSelection.getRangeAt(0);
    range = expandRangeToStartOfLine(range);
    return getDraftEditorSelectionWithNodes(strategyState, null, range.endContainer, range.endOffset, range.startContainer, range.startOffset).selectionState;
  }, 'backward');

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

module.exports = keyCommandBackspaceToStartOfLine;