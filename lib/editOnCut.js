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

var DraftModifier = require("./DraftModifier");

var EditorState = require("./EditorState");

var Style = require("fbjs/lib/Style");

var getFragmentFromSelection = require("./getFragmentFromSelection");

var getScrollPosition = require("fbjs/lib/getScrollPosition");

var isNode = require("./isInstanceOfNode");

function _isNodeScrollable(element, name) {
  var overflow = Style.get(element, name);
  return overflow === 'auto' || overflow === 'scroll';
}

function getScrollParent(node) {
  if (!node) {
    return null;
  }

  var ownerDocument = node.ownerDocument;

  while (node && node !== ownerDocument.body) {
    // 代码块需要支持滚动
    if (!node.dataset.ignoreScrollParent && (_isNodeScrollable(node, 'overflow') || _isNodeScrollable(node, 'overflowY') || _isNodeScrollable(node, 'overflowX'))) {
      return node;
    }

    node = node.parentNode;
  }

  return ownerDocument.defaultView || ownerDocument.parentWindow;
}
/**
 * On `cut` events, native behavior is allowed to occur so that the system
 * clipboard is set properly. This means that we need to take steps to recover
 * the editor DOM state after the `cut` has occurred in order to maintain
 * control of the component.
 *
 * In addition, we can keep a copy of the removed fragment, including all
 * styles and entities, for use as an internal paste.
 */


function editOnCut(editor, e) {
  var editorState = editor._latestEditorState;
  var selection = editorState.getSelection();
  var element = e.target;
  var scrollPosition; // No selection, so there's nothing to cut.

  if (selection.isCollapsed()) {
    e.preventDefault();
    return;
  } // Track the current scroll position so that it can be forced back in place
  // after the editor regains control of the DOM.


  if (isNode(element)) {
    var node = element;
    scrollPosition = getScrollPosition(getScrollParent(node));
  }

  var fragment = getFragmentFromSelection(editorState);
  editor.setClipboard(fragment); // Set `cut` mode to disable all event handling temporarily.

  editor.setMode('cut'); // Let native `cut` behavior occur, then recover control.

  setTimeout(function () {
    // editor.restoreEditorDOM(scrollPosition);
    editor.exitCurrentMode();
    editor.update(removeFragment(editorState));
  }, 0);
}

function removeFragment(editorState) {
  var newContent = DraftModifier.removeRange(editorState.getCurrentContent(), editorState.getSelection(), 'forward');
  return EditorState.push(editorState, newContent, 'remove-range');
}

module.exports = editOnCut;