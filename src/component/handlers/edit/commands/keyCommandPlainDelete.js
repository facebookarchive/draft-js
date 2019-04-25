/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

const EditorState = require('EditorState');
const UnicodeUtils = require('UnicodeUtils');

const moveSelectionForward = require('moveSelectionForward');
const removeTextWithStrategy = require('removeTextWithStrategy');

/**
 * Remove the selected range. If the cursor is collapsed, remove the following
 * character. This operation is Unicode-aware, so removing a single character
 * will remove a surrogate pair properly as well.
 */
function keyCommandPlainDelete(editorState: EditorState): EditorState {
  const afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      const selection = strategyState.getSelection();
      const content = strategyState.getCurrentContent();
      const key = selection.getAnchorKey();
      const offset = selection.getAnchorOffset();
      const charAhead = content.getBlockForKey(key).getText()[offset];
      return moveSelectionForward(
        strategyState,
        charAhead ? UnicodeUtils.getUTF16Length(charAhead, 0) : 1,
      );
    },
    'forward',
  );

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  const selection = editorState.getSelection();

  return EditorState.push(
    editorState,
    afterRemoval.set('selectionBefore', selection),
    selection.isCollapsed() ? 'delete-character' : 'remove-range',
  );
}

module.exports = keyCommandPlainDelete;
