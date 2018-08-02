/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';

const warning = require('warning');
const ContentBlockNode = require('ContentBlockNode');

/**
 * Given a collapsed selection, move the focus `maxDistance` backward within
 * the selected block. If the selection will go beyond the start of the block,
 * move focus to the end of the previous block, but no further.
 *
 * This function is not Unicode-aware, so surrogate pairs will be treated
 * as having length 2.
 */
const moveSelectionBackward = (
  editorState: EditorState,
  maxDistance: number,
): SelectionState => {
  const selection = editorState.getSelection();
  // Should eventually make this an invariant
  warning(
    !selection.isCollapsed(),
    'moveSelectionBackward should only be called with a collapsed SelectionState',
  );
  var content = editorState.getCurrentContent();
  var key = selection.getStartKey();
  var offset = selection.getStartOffset();

  let focusKey = key;
  let focusOffset = 0;

  if (maxDistance > offset) {
    const keyBefore = content.getKeyBefore(key);
    if (keyBefore == null) {
      focusKey = key;
    } else {
      var blockBefore = content.getBlockForKey(keyBefore);

      // blockBefore is the parent of current block
      if (
        blockBefore instanceof ContentBlockNode &&
        blockBefore.getChildKeys().includes(key)
      ) {
        // if there is no block before it or no parent, then blockBefore is a root parent node
        if (!blockBefore.getPrevSiblingKey() || blockBefore.getParentKey()) {
          focusKey = keyBefore;
        } else {
          let node = blockBefore;

          while (
            !node.getChildKeys().isEmpty() &&
            !(node.getPrevSiblingKey() || node.getParentKey())
          ) {
            const prevSibbling = node.getPrevSiblingKey();
            const parent = node.getParentKey();

            if (parent && !prevSibbling) {
              node = content.getBlockForKey(parent);
              continue;
            }

            if (prevSibbling) {
              node = content.getBlockForKey(prevSibbling);
            }

            // We found a sibbling, now we just need to get its last leaf node
            while (!node.getChildKeys().isEmpty()) {
              node = content.getBlockForKey(node.getChildKeys().last());
            }
          }

          focusKey = node.getKey();
          focusOffset = node.getText().length;
        }
      } else {
        focusKey = keyBefore;
        focusOffset = blockBefore.getText().length;
      }
    }
  } else {
    focusOffset = offset - maxDistance;
  }

  return selection.merge({
    focusKey,
    focusOffset,
    isBackward: true,
  });
};

module.exports = moveSelectionBackward;
