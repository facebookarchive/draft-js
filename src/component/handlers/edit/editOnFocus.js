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

import type DraftEditor from 'DraftEditor.react';

const EditorState = require('EditorState');
const UserAgent = require('UserAgent');

function editOnFocus(editor: DraftEditor, e: SyntheticFocusEvent<>): void {
  const editorState = editor._latestEditorState;
  const currentSelection = editorState.getSelection();
  if (currentSelection.getHasFocus()) {
    return;
  }

  const selection = currentSelection.set('hasFocus', true);
  editor.props.onFocus && editor.props.onFocus(e);

  // When the tab containing this text editor is hidden and the user does a
  // find-in-page in a _different_ tab, Chrome on Mac likes to forget what the
  // selection was right after sending this focus event and (if you let it)
  // moves the cursor back to the beginning of the editor, so we force the
  // selection here instead of simply accepting it in order to preserve the
  // old cursor position. See https://crbug.com/540004.
  // But it looks like this is fixed in Chrome 60.0.3081.0.
  // Other browsers also don't have this bug, so we prefer to acceptSelection
  // when possible, to ensure that unfocusing and refocusing a Draft editor
  // doesn't preserve the selection, matching how textareas work.
  if (UserAgent.isBrowser('Chrome < 60.0.3081.0')) {
    editor.update(EditorState.forceSelection(editorState, selection));
  } else {
    editor.update(EditorState.acceptSelection(editorState, selection));
  }
}

module.exports = editOnFocus;
