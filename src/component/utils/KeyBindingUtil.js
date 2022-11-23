/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

'use strict';

const UserAgent = require('UserAgent');

const isSoftNewlineEvent = require('isSoftNewlineEvent');

const isOSX = UserAgent.isPlatform('Mac OS X');

const KeyBindingUtil = {
  /**
   * Check whether the ctrlKey modifier is *not* being used in conjunction with
   * the altKey modifier. If they are combined, the result is an `altGraph`
   * key modifier, which should not be handled by this set of key bindings.
   */
  isCtrlKeyCommand(e: SyntheticKeyboardEvent<>): boolean {
    return !!e.ctrlKey && !e.altKey;
  },

  isOptionKeyCommand(e: SyntheticKeyboardEvent<>): boolean {
    return isOSX && e.altKey;
  },

  usesMacOSHeuristics(): boolean {
    return isOSX;
  },

  hasCommandModifier(e: SyntheticKeyboardEvent<>): boolean {
    return isOSX
      ? !!e.metaKey && !e.altKey
      : KeyBindingUtil.isCtrlKeyCommand(e);
  },

  isSoftNewlineEvent,
};

module.exports = KeyBindingUtil;
