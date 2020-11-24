/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var UserAgent = require("fbjs/lib/UserAgent");

var isSoftNewlineEvent = require("./isSoftNewlineEvent");

var isOSX = UserAgent.isPlatform('Mac OS X');
var KeyBindingUtil = {
  /**
   * Check whether the ctrlKey modifier is *not* being used in conjunction with
   * the altKey modifier. If they are combined, the result is an `altGraph`
   * key modifier, which should not be handled by this set of key bindings.
   */
  isCtrlKeyCommand: function isCtrlKeyCommand(e) {
    return !!e.ctrlKey && !e.altKey;
  },
  isOptionKeyCommand: function isOptionKeyCommand(e) {
    return isOSX && e.altKey;
  },
  usesMacOSHeuristics: function usesMacOSHeuristics() {
    return isOSX;
  },
  hasCommandModifier: function hasCommandModifier(e) {
    return isOSX ? !!e.metaKey && !e.altKey : KeyBindingUtil.isCtrlKeyCommand(e);
  },
  isSoftNewlineEvent: isSoftNewlineEvent
};
module.exports = KeyBindingUtil;