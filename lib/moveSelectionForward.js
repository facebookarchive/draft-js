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

var warning = require("fbjs/lib/warning");
/**
 * Given a collapsed selection, move the focus `maxDistance` forward within
 * the selected block. If the selection will go beyond the end of the block,
 * move focus to the start of the next block, but no further.
 *
 * This function is not Unicode-aware, so surrogate pairs will be treated
 * as having length 2.
 */


function moveSelectionForward(editorState, maxDistance) {
  var selection = editorState.getSelection(); // Should eventually make this an invariant

  process.env.NODE_ENV !== "production" ? warning(selection.isCollapsed(), 'moveSelectionForward should only be called with a collapsed SelectionState') : void 0;
  var key = selection.getStartKey();
  var offset = selection.getStartOffset();
  var content = editorState.getCurrentContent();
  var focusKey = key;
  var focusOffset;
  var block = content.getBlockForKey(key);

  if (maxDistance > block.getText().length - offset) {
    focusKey = content.getKeyAfter(key);
    focusOffset = 0;
  } else {
    focusOffset = offset + maxDistance;
  }

  return selection.merge({
    focusKey: focusKey,
    focusOffset: focusOffset
  });
}

module.exports = moveSelectionForward;