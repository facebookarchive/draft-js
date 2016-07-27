/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnSelect
 * 
 */

'use strict';

var EditorState = require('./EditorState');
var ReactDOM = require('react-dom');

var getDraftEditorSelection = require('./getDraftEditorSelection');

function editOnSelect() {
  if (this._blockSelectEvents) {
    return;
  }

  var editorState = this.props.editorState;
  var documentSelection = getDraftEditorSelection(editorState, ReactDOM.findDOMNode(this.refs.editorContainer).firstChild);
  var updatedSelectionState = documentSelection.selectionState;

  if (updatedSelectionState !== editorState.getSelection()) {
    if (documentSelection.needsRecovery) {
      editorState = EditorState.forceSelection(editorState, updatedSelectionState);
    } else {
      editorState = EditorState.acceptSelection(editorState, updatedSelectionState);
    }
    this.update(editorState);
  }
}

module.exports = editOnSelect;