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

import type {BlockMap} from 'BlockMap';
import type SelectionState from 'SelectionState';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');

const getContentStateFragment = require('getContentStateFragment');
const nullthrows = require('nullthrows');

let clipboard: ?BlockMap = null;

/**
 * Some systems offer a "secondary" clipboard to allow quick internal cut
 * and paste behavior. For instance, Ctrl+K (cut) and Ctrl+Y (paste).
 */
const SecondaryClipboard = {
  cut: function(editorState: EditorState): EditorState {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    let targetRange: ?SelectionState = null;

    if (selection.isCollapsed()) {
      const anchorKey = selection.getAnchorKey();
      const blockEnd = content.getBlockForKey(anchorKey).getLength();

      if (blockEnd === selection.getAnchorOffset()) {
        targetRange = selection
          .set('focusKey', content.getKeyAfter(anchorKey))
          .set('focusOffset', 0);
      } else {
        targetRange = selection.set('focusOffset', blockEnd);
      }
    } else {
      targetRange = selection;
    }

    targetRange = nullthrows(targetRange);
    // TODO: This should actually append to the current state when doing
    // successive ^K commands without any other cursor movement
    clipboard = getContentStateFragment(content, targetRange);

    const afterRemoval = DraftModifier.removeRange(
      content,
      targetRange,
      'forward',
    );

    if (afterRemoval === content) {
      return editorState;
    }

    return EditorState.push(editorState, afterRemoval, 'remove-range');
  },

  paste: function(editorState: EditorState): EditorState {
    if (!clipboard) {
      return editorState;
    }

    const newContent = DraftModifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      clipboard,
    );

    return EditorState.push(editorState, newContent, 'insert-fragment');
  },
};

module.exports = SecondaryClipboard;
