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

function setClipboardData(e: SyntheticClipboardEvent, { text, html }): void {
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
}

module.exports = setClipboardData;
