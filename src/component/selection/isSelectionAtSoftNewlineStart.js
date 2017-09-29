/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isSelectionAtSoftNewlineStart
 * @typechecks
 * @flow
 */

'use strict';

import type EditorState from 'EditorState';

function isSelectionAtSoftNewlineStart(editorState: EditorState): boolean {
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const content = editorState.getCurrentContent();
  const selectedBlock = content.getBlockForKey(startKey);
  return selectedBlock.getText()[startOffset - 1] === '\n';
}

module.exports = isSelectionAtSoftNewlineStart;
