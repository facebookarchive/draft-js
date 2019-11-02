/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');

const getContentStateFragment = require('getContentStateFragment');

/**
 * Transpose the characters on either side of a collapsed cursor, or
 * if the cursor is at the end of the block, transpose the last two
 * characters.
 */
function keyCommandTransposeCharacters(editorState: EditorState): EditorState {
  const selection = editorState.getSelection();
  if (!selection.isCollapsed()) {
    return editorState;
  }

  const offset = selection.getAnchorOffset();
  if (offset === 0) {
    return editorState;
  }

  const blockKey = selection.getAnchorKey();
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const length = block.getLength();

  // Nothing to transpose if there aren't two characters.
  if (length <= 1) {
    return editorState;
  }

  let removalRange;
  let finalSelection;

  if (offset === length) {
    // The cursor is at the end of the block. Swap the last two characters.
    removalRange = selection.set('anchorOffset', offset - 1);
    finalSelection = selection;
  } else {
    removalRange = selection.set('focusOffset', offset + 1);
    finalSelection = removalRange.set('anchorOffset', offset + 1);
  }

  // Extract the character to move as a fragment. This preserves its
  // styling and entity, if any.
  const movedFragment = getContentStateFragment(content, removalRange);
  const afterRemoval = DraftModifier.removeRange(
    content,
    removalRange,
    'backward',
  );

  // After the removal, the insertion target is one character back.
  const selectionAfter = afterRemoval.getSelectionAfter();
  const targetOffset = selectionAfter.getAnchorOffset() - 1;
  const targetRange = selectionAfter.merge({
    anchorOffset: targetOffset,
    focusOffset: targetOffset,
  });

  const afterInsert = DraftModifier.replaceWithFragment(
    afterRemoval,
    targetRange,
    movedFragment,
  );

  const newEditorState = EditorState.push(
    editorState,
    afterInsert,
    'insert-fragment',
  );

  return EditorState.acceptSelection(newEditorState, finalSelection);
}

module.exports = keyCommandTransposeCharacters;
