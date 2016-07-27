/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnCut
 * 
 */

'use strict';

var DraftModifier = require('./DraftModifier');
var EditorState = require('./EditorState');
var Style = require('fbjs/lib/Style');

var getFragmentFromSelection = require('./getFragmentFromSelection');
var getScrollPosition = require('fbjs/lib/getScrollPosition');

/**
 * On `cut` events, native behavior is allowed to occur so that the system
 * clipboard is set properly. This means that we need to take steps to recover
 * the editor DOM state after the `cut` has occurred in order to maintain
 * control of the component.
 *
 * In addition, we can keep a copy of the removed fragment, including all
 * styles and entities, for use as an internal paste.
 */
function editOnCut(e) {
  var _this = this;

  var editorState = this.props.editorState;
  var selection = editorState.getSelection();

  // No selection, so there's nothing to cut.
  if (selection.isCollapsed()) {
    e.preventDefault();
    return;
  }

  // Track the current scroll position so that it can be forced back in place
  // after the editor regains control of the DOM.
  var scrollParent = Style.getScrollParent(e.target);

  var _getScrollPosition = getScrollPosition(scrollParent);

  var x = _getScrollPosition.x;
  var y = _getScrollPosition.y;


  var fragment = getFragmentFromSelection(editorState);
  this.setClipboard(fragment);

  // Set `cut` mode to disable all event handling temporarily.
  this.setRenderGuard();
  this.setMode('cut');

  // Let native `cut` behavior occur, then recover control.
  setTimeout(function () {
    _this.restoreEditorDOM({ x: x, y: y });
    _this.removeRenderGuard();
    _this.exitCurrentMode();
    _this.update(removeFragment(editorState));
  }, 0);
}

function removeFragment(editorState) {
  var newContent = DraftModifier.removeRange(editorState.getCurrentContent(), editorState.getSelection(), 'forward');
  return EditorState.push(editorState, newContent, 'remove-range');
}

module.exports = editOnCut;