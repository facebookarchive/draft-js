/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
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
  const selection: SelectionObject =
    root.ownerDocument.defaultView.getSelection();
  const {anchorNode, anchorOffset, focusNode, focusOffset, rangeCount} =
    selection;

  if (
    // No active selection.
    rangeCount === 0 ||
    // No selection, ever. As in, the user hasn't selected anything since
    // opening the document.
    anchorNode == null ||
    focusNode == null
  ) {
    return {
      selectionState: editorState.getSelection().set('hasFocus', false),
      needsRecovery: false,
    };
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
