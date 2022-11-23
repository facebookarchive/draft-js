/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const AtomicBlockUtils = require('AtomicBlockUtils');
const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
const DefaultDraftInlineStyle = require('DefaultDraftInlineStyle');
const DraftEditor = require('DraftEditor.react');
const DraftEditorBlock = require('DraftEditorBlock.react');
const DraftEntity = require('DraftEntity');
const DraftEntityInstance = require('DraftEntityInstance');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const KeyBindingUtil = require('KeyBindingUtil');
const RawDraftContentState = require('RawDraftContentState');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const convertFromHTML = require('convertFromHTMLToContentBlocks');
const convertFromRawToDraftState = require('convertFromRawToDraftState');
const generateRandomKey = require('generateRandomKey');
const getDefaultKeyBinding = require('getDefaultKeyBinding');
const getVisibleSelectionRect = require('getVisibleSelectionRect');

const DraftPublic = {
  Editor: DraftEditor,
  EditorBlock: DraftEditorBlock,
  EditorState,

  CompositeDecorator: CompositeDraftDecorator,
  Entity: DraftEntity,
  EntityInstance: DraftEntityInstance,

  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  ContentState,
  RawDraftContentState,
  SelectionState,

  AtomicBlockUtils,
  KeyBindingUtil,
  Modifier: DraftModifier,
  RichUtils: RichTextEditorUtil,

  DefaultDraftBlockRenderMap,
  DefaultDraftInlineStyle,

  convertFromHTML,
  convertFromRaw: convertFromRawToDraftState,
  convertToRaw: convertFromDraftStateToRaw,
  genKey: generateRandomKey,
  getDefaultKeyBinding,
  getVisibleSelectionRect,
};

module.exports = DraftPublic;
