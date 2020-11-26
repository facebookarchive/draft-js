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

var DraftJsDebugLogging = require("./DraftJsDebugLogging");

var EditorState = require("./EditorState");

var getContentEditableContainer = require("./getContentEditableContainer");

var getDraftEditorSelection = require("./getDraftEditorSelection");

function editOnSelect(editor) {
  if (editor._blockSelectEvents || editor._latestEditorState !== editor.props.editorState) {
    if (editor._blockSelectEvents) {
      var _editorState = editor.props.editorState;

      var selectionState = _editorState.getSelection();

      DraftJsDebugLogging.logBlockedSelectionEvent({
        // For now I don't think we need any other info
        anonymizedDom: 'N/A',
        extraParams: JSON.stringify({
          stacktrace: new Error().stack
        }),
        selectionState: JSON.stringify(selectionState.toJS())
      });
    }

    return;
  }

  var editorState = editor.props.editorState;
  var documentSelection = getDraftEditorSelection(editorState, getContentEditableContainer(editor));
  var updatedSelectionState = documentSelection.selectionState;

  if (updatedSelectionState !== editorState.getSelection()) {
    if (documentSelection.needsRecovery) {
      editorState = EditorState.forceSelection(editorState, updatedSelectionState);
    } else {
      editorState = EditorState.acceptSelection(editorState, updatedSelectionState);
    }

    editor.update(editorState);
  }
}

module.exports = editOnSelect;