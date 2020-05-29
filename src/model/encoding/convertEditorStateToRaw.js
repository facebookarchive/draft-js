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

import type RawDraftEditorState from 'RawDraftEditorState';
const EditorState =  require('EditorState');
const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');

const convertEditorStateToRaw = (
  editorState: EditorState,
): RawDraftEditorState => {

  let selectionState = editorState.getSelection();

  let rawDraftEditorState:RawDraftEditorState = {
    rawContent: convertFromDraftStateToRaw(editorState.getCurrentContent()),  
    rawSelection: {
      anchorKey: selectionState.getAnchorKey(),
      focusKey: selectionState.getFocusKey(),
      anchorOffset: selectionState.getAnchorOffset(),
      focusOffset: selectionState.getFocusOffset(),
      isBackward: selectionState.getIsBackward(),
      hasFocus: selectionState.getHasFocus(),
    }
  };

  return rawDraftEditorState;
};

module.exports = convertEditorStateToRaw;
