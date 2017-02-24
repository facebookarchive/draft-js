/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnBeforeInput
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';
const isEventHandled = require('isEventHandled');

function editOnBeforeInput(editor: DraftEditor, e: SyntheticInputEvent): void {
  var editorState = editor._latestEditorState;
  if (editorState.isInCompositionMode()) {
    return;
  }

  var chars = e.data;

  // In some cases (ex: IE ideographic space insertion) no character data
  // is provided. There's nothing to do when this happens.
  if (!chars) {
    return;
  }

  // Allow the top-level component to handle the insertion manually. This is
  // useful when triggering interesting behaviors for a character insertion,
  // Simple examples: replacing a raw text ':)' with a smile emoji or image
  // decorator, or setting a block to be a list item after typing '- ' at the
  // start of the block.
  if (
    editor.props.handleBeforeInput &&
    isEventHandled(editor.props.handleBeforeInput(chars))
  ) {
    e.preventDefault();
    return;
  }
}

module.exports = editOnBeforeInput;
