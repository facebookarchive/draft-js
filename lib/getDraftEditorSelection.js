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

var getDraftEditorSelectionWithNodes = require("./getDraftEditorSelectionWithNodes");
/**
 * Convert the current selection range to an anchor/focus pair of offset keys
 * and values that can be interpreted by components.
 */


function getDraftEditorSelection(editorState, root) {
  var selection = root.ownerDocument.defaultView.getSelection();
  var anchorNode = selection.anchorNode,
      anchorOffset = selection.anchorOffset,
      focusNode = selection.focusNode,
      focusOffset = selection.focusOffset,
      rangeCount = selection.rangeCount;

  if ( // No active selection.
  rangeCount === 0 || // No selection, ever. As in, the user hasn't selected anything since
  // opening the document.
  anchorNode == null || focusNode == null) {
    return {
      selectionState: editorState.getSelection().set('hasFocus', false),
      needsRecovery: false
    };
  }

  return getDraftEditorSelectionWithNodes(editorState, root, anchorNode, anchorOffset, focusNode, focusOffset);
}

module.exports = getDraftEditorSelection;