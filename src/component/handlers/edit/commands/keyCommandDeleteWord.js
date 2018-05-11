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

const DraftRemovableWord = require('DraftRemovableWord');
const EditorState = require('EditorState');

const moveSelectionForward = require('moveSelectionForward');
const removeTextWithStrategy = require('removeTextWithStrategy');

/**
 * Delete the word that is right of the cursor, as well as any spaces or
 * punctuation before the word.
 */
function keyCommandDeleteWord(editorState: EditorState): EditorState {
  const afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      const selection = strategyState.getSelection();
      const offset = selection.getStartOffset();
      const key = selection.getStartKey();
      const content = strategyState.getCurrentContent();
      const text = content
        .getBlockForKey(key)
        .getText()
        .slice(offset);
      const toRemove = DraftRemovableWord.getForward(text);

      // If there are no words in front of the cursor, remove the newline.
      return moveSelectionForward(strategyState, toRemove.length || 1);
    },
    'forward',
  );

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

module.exports = keyCommandDeleteWord;
