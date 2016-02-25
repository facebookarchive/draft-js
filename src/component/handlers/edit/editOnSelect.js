/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnSelect
 * @flow
 */

'use strict';

const EditorState = require('EditorState');
const ReactDOM = require('ReactDOM');

const getDraftEditorSelection = require('getDraftEditorSelection');

function editOnSelect(): void {
  if (this._blockSelectEvents) {
    return;
  }

  let editorState = this.props.editorState;
  const documentSelection = getDraftEditorSelection(
    editorState,
    ReactDOM.findDOMNode(this.refs.editorContainer).firstChild
  );
  const updatedSelectionState = documentSelection.selectionState;

  if (updatedSelectionState !== editorState.getSelection()) {
    if (documentSelection.needsRecovery) {
      editorState = EditorState.forceSelection(
        editorState,
        updatedSelectionState
      );
    } else {
      editorState = EditorState.acceptSelection(
        editorState,
        updatedSelectionState
      );
    }
    this.update(editorState);
  }
}

module.exports = editOnSelect;
