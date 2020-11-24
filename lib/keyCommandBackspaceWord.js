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

var DraftRemovableWord = require("./DraftRemovableWord");

var EditorState = require("./EditorState");

var moveSelectionBackward = require("./moveSelectionBackward");

var removeTextWithStrategy = require("./removeTextWithStrategy");
/**
 * Delete the word that is left of the cursor, as well as any spaces or
 * punctuation after the word.
 */


function keyCommandBackspaceWord(editorState) {
  var afterRemoval = removeTextWithStrategy(editorState, function (strategyState) {
    var selection = strategyState.getSelection();
    var offset = selection.getStartOffset(); // If there are no words before the cursor, remove the preceding newline.

    if (offset === 0) {
      return moveSelectionBackward(strategyState, 1);
    }

    var key = selection.getStartKey();
    var content = strategyState.getCurrentContent();
    var text = content.getBlockForKey(key).getText().slice(0, offset);
    var toRemove = DraftRemovableWord.getBackward(text);
    return moveSelectionBackward(strategyState, toRemove.length || 1);
  }, 'backward');

  if (afterRemoval === editorState.getCurrentContent()) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

module.exports = keyCommandBackspaceWord;