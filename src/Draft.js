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

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DraftEditor = require('DraftEditor.react');
const DraftEditorBlock = require('DraftEditorBlock.react');
const DraftModifier = require('DraftModifier');
const DraftEntity = require('DraftEntity');
const DraftEntityInstance = require('DraftEntityInstance');
const EditorState = require('EditorState');
const KeyBindingUtil = require('KeyBindingUtil');
const MediaUtils = require('MediaUtils');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const convertFromHTMLToContentBlocks =
  require('convertFromHTMLToContentBlocks');
const convertFromRawToDraftState = require('convertFromRawToDraftState');
const generateRandomKey = require('generateRandomKey');
const getDefaultKeyBinding = require('getDefaultKeyBinding');
const getVisibleSelectionRect = require('getVisibleSelectionRect');

const adjustBlockDepthForContentState = require('adjustBlockDepthForContentState');
const applyEntityToContentBlock = require('applyEntityToContentBlock');
const applyEntityToContentState = require('applyEntityToContentState');
const getContentStateFragment = require('getContentStateFragment');
const insertFragmentIntoContentState = require('insertFragmentIntoContentState');
const insertIntoList = require('insertIntoList');
const insertTextIntoContentState = require('insertTextIntoContentState');
const removeEntitiesAtEdges = require('removeEntitiesAtEdges');
const removeRangeFromContentState = require('removeRangeFromContentState');
const setBlockTypeForContentState = require('setBlockTypeForContentState');
const splitBlockInContentState = require('splitBlockInContentState');

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
  SelectionState,

  KeyBindingUtil,
  MediaUtils,
  Modifier: DraftModifier,
  RichUtils: RichTextEditorUtil,
  Transactions: {
    adjustBlockDepthForContentState,
    applyEntityToContentBlock,
    applyEntityToContentState,
    getContentStateFragment,
    insertFragmentIntoContentState,
    insertIntoList,
    insertTextIntoContentState,
    removeEntitiesAtEdges,
    removeRangeFromContentState,
    setBlockTypeForContentState,
    splitBlockInContentState
  },

  convertFromHTML: convertFromHTMLToContentBlocks,
  convertFromRaw: convertFromRawToDraftState,
  convertToRaw: convertFromDraftStateToRaw,
  genKey: generateRandomKey,
  getDefaultKeyBinding,
  getVisibleSelectionRect,
};

module.exports = DraftPublic;
