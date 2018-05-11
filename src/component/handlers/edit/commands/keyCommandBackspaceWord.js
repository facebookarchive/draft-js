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

const moveSelectionBackward = require('moveSelectionBackward');
const removeTextWithStrategy = require('removeTextWithStrategy');

/**
 * Delete the word that is left of the cursor, as well as any spaces or
 * punctuation after the word.
 */
function keyCommandBackspaceWord(editorState: EditorState): EditorState {
  const afterRemoval = removeTextWithStrategy(
    editorState,
    strategyState => {
      const selection = strategyState.getSelection();
      const offset = selection.getStartOffset();
      // If there are no words before the cursor, remove the preceding newline.
      if (offset === 0) {
        return moveSelectionBackward(strategyState, 1);
      }
      const key = selection.getStartKey();
      const content = strategyState.getCurrentContent();
      const text = content
        .getBlockForKey(key)
        .getText()
        .slice(0, offset);
      const toRemove = DraftRemovableWord.getBackward(text);
      return moveSelectionBackward(strategyState, toRemove.length || 1);
    },
    'backward',
  );

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

module.exports = keyCommandBackspaceWord;
