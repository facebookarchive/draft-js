/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Draft
 */

'use strict';

var AtomicBlockUtils = require('./AtomicBlockUtils');
var BlockMapBuilder = require('./BlockMapBuilder');
var CharacterMetadata = require('./CharacterMetadata');
var CompositeDraftDecorator = require('./CompositeDraftDecorator');
var ContentBlock = require('./ContentBlock');
var ContentState = require('./ContentState');
var DefaultDraftBlockRenderMap = require('./DefaultDraftBlockRenderMap');
var DefaultDraftInlineStyle = require('./DefaultDraftInlineStyle');
var DraftEditor = require('./DraftEditor.react');
var DraftEditorBlock = require('./DraftEditorBlock.react');
var DraftEntity = require('./DraftEntity');
var DraftModifier = require('./DraftModifier');
var DraftEntityInstance = require('./DraftEntityInstance');
var EditorState = require('./EditorState');
var KeyBindingUtil = require('./KeyBindingUtil');
var RichTextEditorUtil = require('./RichTextEditorUtil');
var SelectionState = require('./SelectionState');

var convertFromDraftStateToRaw = require('./convertFromDraftStateToRaw');
var convertFromHTMLToContentBlocks = require('./convertFromHTMLToContentBlocks');
var convertFromRawToDraftState = require('./convertFromRawToDraftState');
var generateRandomKey = require('./generateRandomKey');
var getDefaultKeyBinding = require('./getDefaultKeyBinding');
var getVisibleSelectionRect = require('./getVisibleSelectionRect');

var DraftPublic = {
  Editor: DraftEditor,
  EditorBlock: DraftEditorBlock,
  EditorState: EditorState,

  CompositeDecorator: CompositeDraftDecorator,
  Entity: DraftEntity,
  EntityInstance: DraftEntityInstance,

  BlockMapBuilder: BlockMapBuilder,
  CharacterMetadata: CharacterMetadata,
  ContentBlock: ContentBlock,
  ContentState: ContentState,
  SelectionState: SelectionState,

  AtomicBlockUtils: AtomicBlockUtils,
  KeyBindingUtil: KeyBindingUtil,
  Modifier: DraftModifier,
  RichUtils: RichTextEditorUtil,

  DefaultDraftBlockRenderMap: DefaultDraftBlockRenderMap,
  DefaultDraftInlineStyle: DefaultDraftInlineStyle,

  convertFromHTML: convertFromHTMLToContentBlocks,
  convertFromRaw: convertFromRawToDraftState,
  convertToRaw: convertFromDraftStateToRaw,
  genKey: generateRandomKey,
  getDefaultKeyBinding: getDefaultKeyBinding,
  getVisibleSelectionRect: getVisibleSelectionRect
};

module.exports = DraftPublic;