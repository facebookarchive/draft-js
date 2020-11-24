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

var DataTransfer = require("fbjs/lib/DataTransfer");

var DraftModifier = require("./DraftModifier");

var EditorState = require("./EditorState");

var findAncestorOffsetKey = require("./findAncestorOffsetKey");

var getCorrectDocumentFromNode = require("./getCorrectDocumentFromNode");

var getTextContentFromFiles = require("./getTextContentFromFiles");

var getUpdatedSelectionState = require("./getUpdatedSelectionState");

var getWindowForNode = require("./getWindowForNode");

var isEventHandled = require("./isEventHandled");

var nullthrows = require("fbjs/lib/nullthrows");
/**
 * Get a SelectionState for the supplied mouse event.
 */


function getSelectionForEvent(event, editorState) {
  var node = null;
  var offset = null;
  var eventTargetDocument = getCorrectDocumentFromNode(event.currentTarget);
  /* $FlowFixMe[prop-missing] (>=0.68.0 site=www,mobile) This comment
   * suppresses an error found when Flow v0.68 was deployed. To see the error
   * delete this comment and run Flow. */

  if (typeof eventTargetDocument.caretRangeFromPoint === 'function') {
    /* $FlowFixMe[incompatible-use] (>=0.68.0 site=www,mobile) This comment
     * suppresses an error found when Flow v0.68 was deployed. To see the error
     * delete this comment and run Flow. */
    var dropRange = eventTargetDocument.caretRangeFromPoint(event.x, event.y);
    node = dropRange.startContainer;
    offset = dropRange.startOffset;
  } else if (event.rangeParent) {
    node = event.rangeParent;
    offset = event.rangeOffset;
  } else {
    return null;
  }

  node = nullthrows(node);
  offset = nullthrows(offset);
  var offsetKey = nullthrows(findAncestorOffsetKey(node));
  return getUpdatedSelectionState(editorState, offsetKey, offset, offsetKey, offset);
}

var DraftEditorDragHandler = {
  /**
   * Drag originating from input terminated.
   */
  onDragEnd: function onDragEnd(editor) {
    editor.exitCurrentMode();
    endDrag(editor);
  },

  /**
   * Handle data being dropped.
   */
  onDrop: function onDrop(editor, e) {
    var data = new DataTransfer(e.nativeEvent.dataTransfer);
    var editorState = editor._latestEditorState;
    var dropSelection = getSelectionForEvent(e.nativeEvent, editorState);
    e.preventDefault();
    editor._dragCount = 0;
    editor.exitCurrentMode();

    if (dropSelection == null) {
      return;
    }

    var files = data.getFiles();

    if (files.length > 0) {
      if (editor.props.handleDroppedFiles && isEventHandled(editor.props.handleDroppedFiles(dropSelection, files))) {
        return;
      }
      /* $FlowFixMe[incompatible-call] This comment suppresses an error found
       * DataTransfer was typed. getFiles() returns an array of <Files extends
       * Blob>, not Blob */


      getTextContentFromFiles(files, function (fileText) {
        fileText && editor.update(insertTextAtSelection(editorState, dropSelection, fileText));
      });
      return;
    }

    var dragType = editor._internalDrag ? 'internal' : 'external';

    if (editor.props.handleDrop && isEventHandled(editor.props.handleDrop(dropSelection, data, dragType))) {// handled
    } else if (editor._internalDrag) {
      editor.update(moveText(editorState, dropSelection));
    } else {
      editor.update(insertTextAtSelection(editorState, dropSelection, data.getText()));
    }

    endDrag(editor);
  }
};

function endDrag(editor) {
  editor._internalDrag = false; // Fix issue #1383
  // Prior to React v16.5.0 onDrop breaks onSelect event:
  // https://github.com/facebook/react/issues/11379.
  // Dispatching a mouseup event on DOM node will make it go back to normal.

  var editorNode = editor.editorContainer;

  if (editorNode) {
    var mouseUpEvent = new MouseEvent('mouseup', {
      view: getWindowForNode(editorNode),
      bubbles: true,
      cancelable: true
    });
    editorNode.dispatchEvent(mouseUpEvent);
  }
}

function moveText(editorState, targetSelection) {
  var newContentState = DraftModifier.moveText(editorState.getCurrentContent(), editorState.getSelection(), targetSelection);
  return EditorState.push(editorState, newContentState, 'insert-fragment');
}
/**
 * Insert text at a specified selection.
 */


function insertTextAtSelection(editorState, selection, text) {
  var newContentState = DraftModifier.insertText(editorState.getCurrentContent(), selection, text, editorState.getCurrentInlineStyle());
  return EditorState.push(editorState, newContentState, 'insert-fragment');
}

module.exports = DraftEditorDragHandler;