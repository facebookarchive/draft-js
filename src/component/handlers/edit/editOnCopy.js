/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnCopy
 * @flow
 */

'use strict';

var getFragmentFromSelection = require('getFragmentFromSelection');

import type DraftEditor from 'DraftEditor.react';

/**
 * If we have a selection, create a ContentState fragment and store
 * it in our internal clipboard. Subsequent paste events will use this
 * fragment if no external clipboard data is supplied.
 */
function editOnCopy(editor: DraftEditor, e: SyntheticClipboardEvent): void {
  var editorState = editor._latestEditorState;
  var selection = editorState.getSelection();

  // No selection, so there's nothing to copy.
  if (selection.isCollapsed()) {
    e.preventDefault();
    return;
  }

  const fragment = getFragmentFromSelection(editor._latestEditorState);
  editor.setClipboard(fragment);
  if (editor.props.convertBlockMapToClipboard) {
    const clipboardDataToPush = editor.props.convertBlockMapToClipboard(fragment);

    // IE doesn't pass a clipboardData object in the event and instead has a non-standard one attached to window
    let clipboard = window.clipboardData;
    if (!clipboard) {
      clipboard = e.nativeEvent.clipboardData;
    }

    // IE and Edge also do not support html here, and if you put it in after the plaintext, then it destroys the plaintext because
    // browsers are why we can't have nice things
    try {
      clipboard.setData(`text/html`, clipboardDataToPush.html);
      clipboard.setData(`text/plain`, clipboardDataToPush.text);
    }
    catch (err) {
      // IE doesn't like certain MIME types so fallback to the one it does
      clipboard.setData(`Text`, clipboardDataToPush.text);
    }

    e.preventDefault();
  }
}

module.exports = editOnCopy;
