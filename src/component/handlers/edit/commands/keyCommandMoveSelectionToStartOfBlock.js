/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const EditorState = require('EditorState');

/**
 * Collapse selection at the start of the first selected block. This is used
 * for Firefox versions that attempt to navigate forward/backward instead of
 * moving the cursor. Other browsers are able to move the cursor natively.
 */
function keyCommandMoveSelectionToStartOfBlock(
  editorState: EditorState,
): EditorState {
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  return EditorState.set(editorState, {
    selection: selection.merge({
      anchorKey: startKey,
      anchorOffset: 0,
      focusKey: startKey,
      focusOffset: 0,
      isBackward: false,
    }),
    forceSelection: true,
  });
}

module.exports = keyCommandMoveSelectionToStartOfBlock;
