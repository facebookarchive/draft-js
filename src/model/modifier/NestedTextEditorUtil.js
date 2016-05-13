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
    switch (command) {
      case 'split-nested-block':
        var contentState = splitNestedBlockInContentState(
          editorState.getCurrentContent(),
          editorState.getSelection()
        );
        return EditorState.push(editorState, contentState, 'split-nested-block');
      default:
        return null;
    }
  },

};

module.exports = NestedTextEditorUtil;
