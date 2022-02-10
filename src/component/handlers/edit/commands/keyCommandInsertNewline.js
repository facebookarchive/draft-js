/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');

function keyCommandInsertNewline(editorState: EditorState): EditorState {
  const contentState = DraftModifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection(),
  );
  return EditorState.push(editorState, contentState, 'split-block');
}

module.exports = keyCommandInsertNewline;
