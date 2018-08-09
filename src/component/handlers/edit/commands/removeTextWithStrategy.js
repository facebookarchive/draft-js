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

import type ContentState from 'ContentState';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';

const DraftModifier = require('DraftModifier');

const gkx = require('gkx');

const experimentalTreeDataSupport = gkx('draft_tree_data_support');

/**
 * For a collapsed selection state, remove text based on the specified strategy.
 * If the selection state is not collapsed, remove the entire selected range.
 */
function removeTextWithStrategy(
  editorState: EditorState,
  strategy: (editorState: EditorState) => SelectionState,
  direction: DraftRemovalDirection,
): ContentState {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  let target = selection;
  const anchorKey = selection.getAnchorKey();
  const focusKey = selection.getFocusKey();
  const anchorBlock = content.getBlockForKey(anchorKey);
  if (experimentalTreeDataSupport) {
    if (direction === 'forward') {
      if (anchorKey !== focusKey) {
        // For now we ignore forward delete across blocks,
        // if there is demand for this we will implement it.
        return content;
      }
    }
  }
  if (selection.isCollapsed()) {
    if (direction === 'forward') {
      if (editorState.isSelectionAtEndOfContent()) {
        return content;
      }
      if (experimentalTreeDataSupport) {
        const isAtEndOfBlock =
          selection.getAnchorOffset() ===
          content.getBlockForKey(anchorKey).getLength();
        if (isAtEndOfBlock) {
          const anchorBlockSibling = content.getBlockForKey(
            anchorBlock.nextSibling,
          );
          if (!anchorBlockSibling || anchorBlockSibling.getLength() === 0) {
            // For now we ignore forward delete at the end of a block,
            // if there is demand for this we will implement it.
            return content;
          }
        }
      }
    } else if (editorState.isSelectionAtStartOfContent()) {
      return content;
    }

    target = strategy(editorState);
    if (target === selection) {
      return content;
    }
  }
  return DraftModifier.removeRange(content, target, direction);
}

module.exports = removeTextWithStrategy;
