/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule moveSelectionForward
 * @flow
 */

'use strict';

import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';

const nullthrows = require('nullthrows');

/**
 * Given a collapsed selection, move the focus `maxDistance` forward within
 * the selected block. If the selection will go beyond the end of the block,
 * move focus to the start of the next block, but no further.
 *
 * This function is not Unicode-aware, so surrogate pairs will be treated
 * as having length 2.
 */
function moveSelectionForward(
  editorState: EditorState,
  maxDistance: number,
): SelectionState {
  var selection = editorState.getSelection();
  var key = selection.getStartKey();
  var offset = selection.getStartOffset();
  var content = editorState.getCurrentContent();

  var focusKey = key;
  var focusOffset;

  var block = nullthrows(content.getBlockForKey(key));

  if (maxDistance > (block.getText().length - offset)) {
    focusKey = content.getKeyAfter(key);
    focusOffset = 0;
  } else {
    focusOffset = offset + maxDistance;
  }

  return focusKey != null ?
    selection.merge({focusKey, focusOffset}) :
    selection;
}

module.exports = moveSelectionForward;
