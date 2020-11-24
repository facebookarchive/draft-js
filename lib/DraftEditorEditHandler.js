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

var onBeforeInput = require("./editOnBeforeInput");

var onBlur = require("./editOnBlur");

var onCompositionStart = require("./editOnCompositionStart");

var onCopy = require("./editOnCopy");

var onCut = require("./editOnCut");

var onDragOver = require("./editOnDragOver");

var onDragStart = require("./editOnDragStart");

var onFocus = require("./editOnFocus");

var onInput = require("./editOnInput");

var onKeyDown = require("./editOnKeyDown");

var onPaste = require("./editOnPaste");

var onSelect = require("./editOnSelect");

var isChrome = UserAgent.isBrowser('Chrome');
var isFirefox = UserAgent.isBrowser('Firefox');
var selectionHandler = isChrome || isFirefox ? onSelect : function (e) {};
var DraftEditorEditHandler = {
  onBeforeInput: onBeforeInput,
  onBlur: onBlur,
  onCompositionStart: onCompositionStart,
  onCopy: onCopy,
  onCut: onCut,
  onDragOver: onDragOver,
  onDragStart: onDragStart,
  onFocus: onFocus,
  onInput: onInput,
  onKeyDown: onKeyDown,
  onPaste: onPaste,
  onSelect: onSelect,
  // In certain cases, contenteditable on chrome does not fire the onSelect
  // event, causing problems with cursor positioning. Therefore, the selection
  // state update handler is added to more events to ensure that the selection
  // state is always synced with the actual cursor positions.
  onMouseUp: selectionHandler,
  onKeyUp: selectionHandler
};
module.exports = DraftEditorEditHandler;