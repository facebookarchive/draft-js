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

import type DraftEditor from 'DraftEditor.react';

const DraftJsDebugLogging = require('DraftJsDebugLogging');
const EditorState = require('EditorState');

const getContentEditableContainer = require('getContentEditableContainer');
const getDraftEditorSelection = require('getDraftEditorSelection');

function editOnSelect(editor: DraftEditor): void {
  if (
    editor._blockSelectEvents ||
    editor._latestEditorState !== editor.props.editorState
  ) {
    if (editor._blockSelectEvents) {
      const editorState = editor.props.editorState;
      const selectionState = editorState.getSelection();
      DraftJsDebugLogging.logBlockedSelectionEvent({
        // For now I don't think we need any other info
        anonymizedDom: 'N/A',
        extraParams: JSON.stringify({stacktrace: new Error().stack}),
        selectionState: JSON.stringify(selectionState.toJS()),
      });
    }
    return;
  }

  let editorState = editor.props.editorState;
  const documentSelection = getDraftEditorSelection(
    editorState,
    getContentEditableContainer(editor),
  );
  const updatedSelectionState = documentSelection.selectionState;

  if (updatedSelectionState !== editorState.getSelection()) {
    if (documentSelection.needsRecovery) {
      editorState = EditorState.forceSelection(
        editorState,
        updatedSelectionState,
      );
    } else {
      editorState = EditorState.acceptSelection(
        editorState,
        updatedSelectionState,
      );
    }
    editor.update(editorState);
  }
}

module.exports = editOnSelect;
