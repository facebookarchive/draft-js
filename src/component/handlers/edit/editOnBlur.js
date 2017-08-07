/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnBlur
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const DraftFeatureFlags = require('DraftFeatureFlags');
const EditorState = require('EditorState');
const UserAgent = require('UserAgent');

const containsNode = require('containsNode');
const getActiveElement = require('getActiveElement');

const isWebKit = UserAgent.isEngine('WebKit');

function editOnBlur(editor: DraftEditor, e: SyntheticEvent): void {
  // Webkit has a bug in which blurring a contenteditable by clicking on
  // other active elements will trigger the `blur` event but will not remove
  // the DOM selection from the contenteditable. We therefore force the
  // issue to be certain, checking whether the active element is `body`
  // to force it when blurring occurs within the window (as opposed to
  // clicking to another tab or window).
  if (isWebKit && getActiveElement() === document.body) {
    const selection = global.getSelection();
    const editorNode = editor.refs.editor;
    if (
      !DraftFeatureFlags.draft_cautious_range_removal_on_blur ||
      selection.rangeCount === 1 &&
      containsNode(editorNode, selection.anchorNode) &&
      containsNode(editorNode, selection.focusNode)
    ) {
      selection.removeAllRanges();
    }
  }

  var editorState = editor._latestEditorState;
  var currentSelection = editorState.getSelection();
  if (!currentSelection.getHasFocus()) {
    return;
  }

  var selection = currentSelection.set('hasFocus', false);
  editor.props.onBlur && editor.props.onBlur(e);
  editor.update(EditorState.acceptSelection(editorState, selection));
}

module.exports = editOnBlur;
