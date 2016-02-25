/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnKeyDown
 * @flow
 */

'use strict';

const EditorState = require('EditorState');
const Keys = require('Keys');
const SecondaryClipboard = require('SecondaryClipboard');

const keyCommandBackspaceToStartOfLine = require('keyCommandBackspaceToStartOfLine');
const keyCommandBackspaceWord = require('keyCommandBackspaceWord');
const keyCommandDeleteWord = require('keyCommandDeleteWord');
const keyCommandInsertNewline = require('keyCommandInsertNewline');
const keyCommandPlainBackspace = require('keyCommandPlainBackspace');
const keyCommandPlainDelete = require('keyCommandPlainDelete');
const keyCommandMoveSelectionToEndOfBlock = require('keyCommandMoveSelectionToEndOfBlock');
const keyCommandMoveSelectionToStartOfBlock = require('keyCommandMoveSelectionToStartOfBlock');
const keyCommandTransposeCharacters = require('keyCommandTransposeCharacters');
const keyCommandUndo = require('keyCommandUndo');

import type {DraftEditorCommand} from 'DraftEditorCommand';

/**
 * Map a `DraftEditorCommand` command value to a corresponding function.
 */
function onKeyCommand(
  command: DraftEditorCommand,
  editorState: EditorState
): EditorState {
  switch (command) {
    case 'redo':
      return EditorState.redo(editorState);
    case 'delete':
      return keyCommandPlainDelete(editorState);
    case 'delete-word':
      return keyCommandDeleteWord(editorState);
    case 'backspace':
      return keyCommandPlainBackspace(editorState);
    case 'backspace-word':
      return keyCommandBackspaceWord(editorState);
    case 'backspace-to-start-of-line':
      return keyCommandBackspaceToStartOfLine(editorState);
    case 'split-block':
      return keyCommandInsertNewline(editorState);
    case 'transpose-characters':
      return keyCommandTransposeCharacters(editorState);
    case 'move-selection-to-start-of-block':
      return keyCommandMoveSelectionToStartOfBlock(editorState);
    case 'move-selection-to-end-of-block':
      return keyCommandMoveSelectionToEndOfBlock(editorState);
    case 'secondary-cut':
      return SecondaryClipboard.cut(editorState);
    case 'secondary-paste':
      return SecondaryClipboard.paste(editorState);
    default:
      return editorState;
  }
}

/**
 * Intercept keydown behavior to handle keys and commands manually, if desired.
 *
 * Keydown combinations may be mapped to `DraftCommand` values, which may
 * correspond to command functions that modify the editor or its contents.
 *
 * See `getDefaultKeyBinding` for defaults. Alternatively, the top-level
 * component may provide a custom mapping via the `keyBindingFn` prop.
 */
function editOnKeyDown(e: SyntheticKeyboardEvent): void {
  const keyCode = e.which;
  const editorState = this.props.editorState;

  switch (keyCode) {
    case Keys.RETURN:
      e.preventDefault();
      // The top-level component may manually handle newline insertion. If
      // no special handling is performed, insert a newline.
      if (!this.props.handleReturn || !this.props.handleReturn(e)) {
        this.update(keyCommandInsertNewline(editorState));
      }
      return;
    case Keys.ESC:
      e.preventDefault();
      this.props.onEscape && this.props.onEscape(e);
      return;
    case Keys.TAB:
      this.props.onTab && this.props.onTab(e);
      return;
    case Keys.UP:
      this.props.onUpArrow && this.props.onUpArrow(e);
      return;
    case Keys.DOWN:
      this.props.onDownArrow && this.props.onDownArrow(e);
      return;
  }

  const command = this.props.keyBindingFn(e);

  // If no command is specified, allow keydown event to continue.
  if (!command) {
    return;
  }

  if (command === 'undo') {
    // Since undo requires some special updating behavior to keep the editor
    // in sync, handle it separately.
    keyCommandUndo(e, editorState, this.update);
    return;
  }

  // At this point, we know that we're handling a command of some kind, so
  // we don't want to insert a character following the keydown.
  e.preventDefault();

  // Allow components higher up the tree to handle the command first.
  if (this.props.handleKeyCommand && this.props.handleKeyCommand(command)) {
    return;
  }

  const newState = onKeyCommand(command, editorState);
  if (newState !== editorState) {
    this.update(newState);
  }
}

module.exports = editOnKeyDown;
