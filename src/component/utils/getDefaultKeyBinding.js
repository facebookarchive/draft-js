/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {DraftEditorCommand} from 'DraftEditorCommand';

const KeyBindingUtil = require('KeyBindingUtil');
const Keys = require('Keys');
const UserAgent = require('UserAgent');

const isOSX = UserAgent.isPlatform('Mac OS X');

// Firefox on OSX had a bug resulting in navigation instead of cursor movement.
// This bug was fixed in Firefox 29. Feature detection is virtually impossible
// so we just check the version number. See #342765.
const shouldFixFirefoxMovement = isOSX && UserAgent.isBrowser('Firefox < 29');

const {hasCommandModifier, isCtrlKeyCommand} = KeyBindingUtil;

function shouldRemoveWord(e: SyntheticKeyboardEvent<>): boolean {
  return (isOSX && e.altKey) || isCtrlKeyCommand(e);
}

/**
 * Get the appropriate undo/redo command for a Z key command.
 */
function getZCommand(e: SyntheticKeyboardEvent<>): ?DraftEditorCommand {
  if (!hasCommandModifier(e)) {
    return null;
  }
  return e.shiftKey ? 'redo' : 'undo';
}

function getDeleteCommand(e: SyntheticKeyboardEvent<>): ?DraftEditorCommand {
  // Allow default "cut" behavior for PCs on Shift + Delete.
  if (!isOSX && e.shiftKey) {
    return null;
  }
  return shouldRemoveWord(e) ? 'delete-word' : 'delete';
}

function getBackspaceCommand(e: SyntheticKeyboardEvent<>): ?DraftEditorCommand {
  if (hasCommandModifier(e) && isOSX) {
    return 'backspace-to-start-of-line';
  }
  return shouldRemoveWord(e) ? 'backspace-word' : 'backspace';
}

/**
 * Retrieve a bound key command for the given event.
 */
function getDefaultKeyBinding(
  e: SyntheticKeyboardEvent<>,
): ?DraftEditorCommand {
  switch (e.keyCode) {
    case 66: // B
      return hasCommandModifier(e) ? 'bold' : null;
    case 68: // D
      return isCtrlKeyCommand(e) ? 'delete' : null;
    case 72: // H
      return isCtrlKeyCommand(e) ? 'backspace' : null;
    case 73: // I
      return hasCommandModifier(e) ? 'italic' : null;
    case 74: // J
      return hasCommandModifier(e) ? 'code' : null;
    case 75: // K
      return isOSX && isCtrlKeyCommand(e) ? 'secondary-cut' : null;
    case 77: // M
      return isCtrlKeyCommand(e) ? 'split-block' : null;
    case 79: // O
      return isCtrlKeyCommand(e) ? 'split-block' : null;
    case 84: // T
      return isOSX && isCtrlKeyCommand(e) ? 'transpose-characters' : null;
    case 85: // U
      return hasCommandModifier(e) ? 'underline' : null;
    case 87: // W
      return isOSX && isCtrlKeyCommand(e) ? 'backspace-word' : null;
    case 89: // Y
      if (isCtrlKeyCommand(e)) {
        return isOSX ? 'secondary-paste' : 'redo';
      }
      return null;
    case 90: // Z
      return getZCommand(e) || null;
    case Keys.RETURN:
      return 'split-block';
    case Keys.DELETE:
      return getDeleteCommand(e);
    case Keys.BACKSPACE:
      return getBackspaceCommand(e);
    // LEFT/RIGHT handlers serve as a workaround for a Firefox bug.
    case Keys.LEFT:
      return shouldFixFirefoxMovement && hasCommandModifier(e)
        ? 'move-selection-to-start-of-block'
        : null;
    case Keys.RIGHT:
      return shouldFixFirefoxMovement && hasCommandModifier(e)
        ? 'move-selection-to-end-of-block'
        : null;
    default:
      return null;
  }
}

module.exports = getDefaultKeyBinding;
