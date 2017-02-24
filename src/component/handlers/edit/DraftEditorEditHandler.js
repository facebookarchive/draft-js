/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEditorEditHandler
 * @flow
 */

'use strict';
import type DraftEditor from 'DraftEditor.react';

const draftInputHandler = require('DraftInputHandler');
const onBeforeInput = require('editOnBeforeInput');
const onBlur = require('editOnBlur');
const onCopy = require('editOnCopy');
const onCut = require('editOnCut');
const onDragOver = require('editOnDragOver');
const onDragStart = require('editOnDragStart');
const onFocus = require('editOnFocus');
const onInput = require('editOnInput');
const onKeyDown = require('editOnKeyDown');
const onPaste = require('editOnPaste');
const onSelect = require('editOnSelect');

// The array of handlers called in sequence.
let handlers = [{
  onBeforeInput,
  onBlur,
  onCopy,
  onCut,
  onDragOver,
  onDragStart,
  onFocus,
  onKeyDown,
  onPaste,
  onSelect,
}, draftInputHandler, {
  // onInput should be handled after inputHandler
  onInput,
}];

const DraftEditorEditHandler = [
  'onBeforeInput',
  'onBlur',
  'onCompositionStart',
  'onCompositionEnd',
  'onCopy',
  'onCut',
  'onDragOver',
  'onDragStart',
  'onFocus',
  'onInput',
  'onKeyUp',
  'onKeyDown',
  'onPaste',
  'onSelect',
].reduce((prev, key) => {
  prev[key] = function(editor: DraftEditor, e: SyntheticKeyboardEvent) {
    handlers.forEach((handler: {[key: string]: (editor: DraftEditor, e: any)=>void}) => {
      handler[key] && handler[key](editor, e);
    });
  };
  return prev;
}, {});

module.exports = DraftEditorEditHandler;
