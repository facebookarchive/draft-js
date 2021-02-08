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

import type {DOMDerivedSelection} from 'DOMDerivedSelection';
import type {SelectionObject} from 'DraftDOMTypes';
import type EditorState from 'EditorState';

const getDraftEditorSelectionWithNodes = require('getDraftEditorSelectionWithNodes');

/**
 * Convert the current selection range to an anchor/focus pair of offset keys
 * and values that can be interpreted by components.
 */
function getDraftEditorSelection(
  editorState: EditorState,
  root: HTMLElement,
): DOMDerivedSelection {
  const selection: SelectionObject = root.ownerDocument.defaultView.getSelection();
  let {
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
    rangeCount,
  } = selection;

  let newAnchorNode = anchorNode
  let editorRoot = null
  if (newAnchorNode) {
    while(newAnchorNode.nodeType !== 1 && newAnchorNode.parentNode) {
      newAnchorNode = newAnchorNode.parentNode
    }
    editorRoot = newAnchorNode.closest('.public-DraftEditor-content')
  }


  if (
    // No active selection.
    rangeCount === 0 ||
    // No selection, ever. As in, the user hasn't selected anything since
    // opening the document.
    anchorNode == null ||
    focusNode == null || editorRoot === null || editorRoot !== root
  ) {
    return {
      selectionState: editorState.getSelection().set('hasFocus', false),
      needsRecovery: false,
    };
  }

  // 特殊处理代码块的选中
  if (
    anchorNode.classList?.contains('not-display-enter') &&
    focusNode.classList?.contains('not-display-enter')
  ) {
    return {
      selectionState: editorState.getSelection(),
      needsRecovery: false,
    };
  }

  // 全选时，可能某一侧是代码块，这里只需要处理focusNode的after
  if (!selection.isCollapsed && focusNode.parentNode?.classList?.contains('not-display-enter')) {
    const node = focusNode.parentNode;
    if (node?.classList?.contains('not-display-enter--after')) {
      const textNodes = node.previousElementSibling?.querySelectorAll(
        'code:last-child span[data-text]',
      );
      if (textNodes.length) {
        focusNode = textNodes[textNodes.length - 1];
        focusOffset = focusNode.innerText.length;
      }
    }
  }

  return getDraftEditorSelectionWithNodes(
    editorState,
    root,
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  );
}

module.exports = getDraftEditorSelection;
