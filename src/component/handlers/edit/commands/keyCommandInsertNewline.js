/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyCommandInsertNewline
 * @flow
 */

'use strict';

var DraftModifier = require('DraftModifier');
var EditorState = require('EditorState');

function keyCommandInsertNewline(editorState: EditorState): EditorState {
  var contentState = DraftModifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  );

  var newEditorState = EditorState.push(
    editorState,
    contentState,
    'split-block');

  // Make sure that any inline style overrides are re-applied.
  return EditorState.setInlineStyleOverride(
    newEditorState,
    editorState.getCurrentInlineStyle());
}

module.exports = keyCommandInsertNewline;
