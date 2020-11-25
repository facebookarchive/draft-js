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
/**
 * The user has begun using an IME input system. Switching to `composite` mode
 * allows handling composition input and disables other edit behavior.
 */


function editOnCompositionStart(editor, e) {
  editor.setMode('composite');
  editor.update(EditorState.set(editor._latestEditorState, {
    inCompositionMode: true
  })); // Allow composition handler to interpret the compositionstart event

  editor._onCompositionStart(e);
}

module.exports = editOnCompositionStart;