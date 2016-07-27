/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorEditHandler
 * 
 */

'use strict';

var onBeforeInput = require('./editOnBeforeInput');
var onBlur = require('./editOnBlur');
var onCompositionStart = require('./editOnCompositionStart');
var onCopy = require('./editOnCopy');
var onCut = require('./editOnCut');
var onDragOver = require('./editOnDragOver');
var onDragStart = require('./editOnDragStart');
var onFocus = require('./editOnFocus');
var onInput = require('./editOnInput');
var onKeyDown = require('./editOnKeyDown');
var onPaste = require('./editOnPaste');
var onSelect = require('./editOnSelect');

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
  onSelect: onSelect
};

module.exports = DraftEditorEditHandler;