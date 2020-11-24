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

var DraftModifier = require("./DraftModifier");

var gkx = require("./gkx");

var experimentalTreeDataSupport = gkx('draft_tree_data_support');
/**
 * For a collapsed selection state, remove text based on the specified strategy.
 * If the selection state is not collapsed, remove the entire selected range.
 */

function removeTextWithStrategy(editorState, strategy, direction) {
  var selection = editorState.getSelection();
  var content = editorState.getCurrentContent();
  var target = selection;
  var anchorKey = selection.getAnchorKey();
  var focusKey = selection.getFocusKey();
  var anchorBlock = content.getBlockForKey(anchorKey);

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
        var isAtEndOfBlock = selection.getAnchorOffset() === content.getBlockForKey(anchorKey).getLength();

        if (isAtEndOfBlock) {
          var anchorBlockSibling = content.getBlockForKey(anchorBlock.nextSibling);

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