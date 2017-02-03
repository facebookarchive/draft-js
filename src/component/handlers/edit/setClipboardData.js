/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

var UserAgent = require('UserAgent');
var setImmediate = require('setImmediate');

var isEdge = UserAgent.isBrowser('Edge');

function setClipboardData(e: SyntheticClipboardEvent, editor: DraftEditor, {text, html}): void {

  // IE doesn't pass a clipboardData object in the event and instead has a non-standard one attached to window
  let clipboard = window.clipboardData;

  if (clipboard) {

    const testClipboardString = 'setting the clipboard works';
    clipboard.setData('Text', testClipboardString);

    if (clipboard.getData('Text') !== testClipboardString) {

      doCopyTrap(editor, html);
      // Let the native event go through
      return;
    }
  } else {

    if (isEdge) {
      doCopyTrap(editor, html);
      return;
    }

    clipboard = e.nativeEvent.clipboardData;
  }

  // see copy for note about why html/plain order matters here
  try {
    clipboard.setData('text/html', html);
    clipboard.setData('text/plain', text);
  }
  catch (err) {
    clipboard.setData('Text', text);
  }

  e.preventDefault();
}

function doCopyTrap(editor: DraftEditor, html: string) {

  // We can't always set the clipboard data in IE because of various Group Policies that might be applied.
  // We need to populate a "copy trap" div with the new HTML and switch focus so the native copy can go
  // through into that div
  editor.setMode('copy');
  editor._copyTrap.innerHTML = html;

  var selection = window.getSelection();
  var originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

  var copyTrapRange = document.createRange();
  copyTrapRange.selectNodeContents(editor._copyTrap);

  editor._copyTrap.focus();

  selection.removeAllRanges();
  selection.addRange(copyTrapRange);

  setImmediate(() => {
    editor.focus();
    selection = window.getSelection();
    selection.removeAllRanges();

    if (originalRange) {
      selection.addRange(originalRange);
    }
    editor.exitCurrentMode();
    editor._copyTrap.innerHtml = '';
  });
}

module.exports = setClipboardData;
