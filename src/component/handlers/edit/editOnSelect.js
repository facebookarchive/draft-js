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

import type DraftEditor from 'DraftEditor.react';

const DraftJsDebugLogging = require('DraftJsDebugLogging');
const EditorState = require('EditorState');
const ReactDOM = require('ReactDOM');

const getDraftEditorSelection = require('getDraftEditorSelection');
const invariant = require('invariant');

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
  const editorNode = ReactDOM.findDOMNode(editor.editorContainer);
  invariant(editorNode, 'Missing editorNode');
  invariant(
    editorNode.firstChild instanceof HTMLElement,
    'editorNode.firstChild is not an HTMLElement',
  );
  const documentSelection = getDraftEditorSelection(
    editorState,
    editorNode.firstChild,
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
