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
  var _anchorNode$classList, _focusNode$classList, _focusNode$parentNode, _focusNode$parentNode2;

  var selection = root.ownerDocument.defaultView.getSelection();
  var anchorNode = selection.anchorNode,
      anchorOffset = selection.anchorOffset,
      focusNode = selection.focusNode,
      focusOffset = selection.focusOffset,
      rangeCount = selection.rangeCount;
  var newAnchorNode = anchorNode;
  var editorRoot = null;

  if (newAnchorNode) {
    while (newAnchorNode.nodeType !== 1 && newAnchorNode.parentNode) {
      newAnchorNode = newAnchorNode.parentNode;
    }

    editorRoot = newAnchorNode.closest('.public-DraftEditor-content');
  }

  if ( // No active selection.
  rangeCount === 0 || // No selection, ever. As in, the user hasn't selected anything since
  // opening the document.
  anchorNode == null || focusNode == null || editorRoot === null || editorRoot !== root) {
    return {
      selectionState: editorState.getSelection().set('hasFocus', false),
      needsRecovery: false
    };
  } // 特殊处理代码块的选中


  if (((_anchorNode$classList = anchorNode.classList) === null || _anchorNode$classList === void 0 ? void 0 : _anchorNode$classList.contains('not-display-enter')) && ((_focusNode$classList = focusNode.classList) === null || _focusNode$classList === void 0 ? void 0 : _focusNode$classList.contains('not-display-enter'))) {
    return {
      selectionState: editorState.getSelection(),
      needsRecovery: false
    };
  } // 全选时，可能某一侧是代码块，这里只需要处理focusNode的after


  if (!selection.isCollapsed && ((_focusNode$parentNode = focusNode.parentNode) === null || _focusNode$parentNode === void 0 ? void 0 : (_focusNode$parentNode2 = _focusNode$parentNode.classList) === null || _focusNode$parentNode2 === void 0 ? void 0 : _focusNode$parentNode2.contains('not-display-enter'))) {
    var _node$classList;

    var node = focusNode.parentNode;

    if (node === null || node === void 0 ? void 0 : (_node$classList = node.classList) === null || _node$classList === void 0 ? void 0 : _node$classList.contains('not-display-enter--after')) {
      var _node$previousElement;

      var textNodes = (_node$previousElement = node.previousElementSibling) === null || _node$previousElement === void 0 ? void 0 : _node$previousElement.querySelectorAll('code:last-child span[data-text]');

      if (textNodes.length) {
        focusNode = textNodes[textNodes.length - 1];
        focusOffset = focusNode.innerText.length;
      }
    }
  }

  return getDraftEditorSelectionWithNodes(editorState, root, anchorNode, anchorOffset, focusNode, focusOffset);
}

module.exports = getDraftEditorSelection;