/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const EditorState = require('EditorState');

const containsNode = require('containsNode');
const getActiveElement = require('getActiveElement');

function editOnBlur(editor: DraftEditor, e: SyntheticEvent<>): void {
  // In a contentEditable element, when you select a range and then click
  // another active element, this does trigger a `blur` event but will not
  // remove the DOM selection from the contenteditable.
  // This is consistent across all browsers, but we prefer that the editor
  // behave like a textarea, where a `blur` event clears the DOM selection.
  // We therefore force the issue to be certain, checking whether the active
  // element is `body` to force it when blurring occurs within the window (as
  // opposed to clicking to another tab or window).
  if (getActiveElement() === document.body) {
    const selection = global.getSelection();
    const editorNode = editor.editor;
    if (
      selection.rangeCount === 1 &&
      containsNode(editorNode, selection.anchorNode) &&
      containsNode(editorNode, selection.focusNode)
    ) {
      selection.removeAllRanges();
    }
  }

  const editorState = editor._latestEditorState;
  const currentSelection = editorState.getSelection();
  if (!currentSelection.getHasFocus()) {
    return;
  }

  const selection = currentSelection.set('hasFocus', false);
  editor.props.onBlur && editor.props.onBlur(e);
  editor.update(EditorState.acceptSelection(editorState, selection));
}

module.exports = editOnBlur;
