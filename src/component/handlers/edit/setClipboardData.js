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

var isIE = UserAgent.isBrowser('IE');

function setClipboardData(e: SyntheticClipboardEvent, editor: DraftEditor, { text, html }): void {
  if (isIE) {

    // We can't always set the clipboard data in IE because of various Group Policies that might be applied.
    // We need to populate a "copy trap" div with the new HTML and switch focus so the native copy can go
    // through into that div
    editor._copyTrap.innerHTML = html;

    var selection = window.getSelection();
    var copyTrapRange = document.createRange();
    copyTrapRange.selectNodeContents(editor._copyTrap);
    selection.removeAllRanges();
    selection.addRange(copyTrapRange);

    editor._copyTrap.focus();

    setImmediate(() => {
      editor.focus();
      editor._copyTrap.innerHtml = '';
    });

    // Let the native event go through
    return;
  }

  // IE doesn't pass a clipboardData object in the event and instead has a non-standard one attached to window
  let clipboard = window.clipboardData;
  if (!clipboard) {
    clipboard = e.nativeEvent.clipboardData;
  }

  // see copy for note about why html/plain order matters here
  try {
    clipboard.setData(`text/html`, html);
    clipboard.setData(`text/plain`, text);
  }
  catch (err) {
    clipboard.setData(`Text`, text);
  }

  e.preventDefault();
}

module.exports = setClipboardData;
