/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnBlur
 * @flow
 */

'use strict';

const EditorState = require('EditorState');
const UserAgent = require('UserAgent');

const getActiveElement = require('getActiveElement');

const isWebKit = UserAgent.isEngine('WebKit');

function editOnBlur(e: SyntheticEvent): void {
  // Webkit has a bug in which blurring a contenteditable by clicking on
  // other active elements will trigger the `blur` event but will not remove
  // the DOM selection from the contenteditable. We therefore force the
  // issue to be certain, checking whether the active element is `body`
  // to force it when blurring occurs within the window (as opposed to
  // clicking to another tab or window).
  if (isWebKit && getActiveElement() === document.body) {
    global.getSelection().removeAllRanges();
  }

  const editorState = this.props.editorState;
  const currentSelection = editorState.getSelection();
  if (!currentSelection.getHasFocus()) {
    return;
  }

  const selection = currentSelection.set('hasFocus', false);
  this.props.onBlur && this.props.onBlur(e);
  this.update(EditorState.acceptSelection(editorState, selection));
}

module.exports = editOnBlur;
