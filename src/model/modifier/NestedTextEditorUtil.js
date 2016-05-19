/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule NestedTextEditorUtil
 * @typechecks
 * @flow
 */

const EditorState = require('EditorState');
const splitNestedBlockInContentState = require('splitNestedBlockInContentState');

import type {DraftEditorCommand} from 'DraftEditorCommand';

const NestedTextEditorUtil = {

  handleKeyCommand: function(
    editorState: EditorState,
    command: DraftEditorCommand
  ): ?EditorState {
    var selectionState = editorState.getSelection();
    var contentState = editorState.getCurrentContent();
    var key = selectionState.getAnchorKey();
    var nestedBlocks = contentState.getBlockChildren(key);

    if (command === 'split-block' && nestedBlocks.size > 0) {
      command = 'split-nested-block';
    }

    switch (command) {
      case 'split-nested-block':
        contentState = splitNestedBlockInContentState(contentState, selectionState);
        return EditorState.push(editorState, contentState, 'split-nested-block');
      default:
        return null;
    }
  },

  keyBinding: function(e) {
    if (e.keyCode === 13 /* `Enter` key */ && e.shiftKey) {
      return 'split-nested-block';
    }
  }

};

module.exports = NestedTextEditorUtil;
