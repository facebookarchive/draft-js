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
const DraftModifier = require('DraftModifier');
const DraftEntity = require('DraftEntity');
const DraftEntityInstance = require('DraftEntityInstance');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const convertFromRawToDraftState = require('convertFromRawToDraftState');
const generateBlockKey = require('generateBlockKey');

var DraftPublic = {
  Editor: DraftEditor,
  EditorState,

  CompositeDecorator: CompositeDraftDecorator,
  Entity: DraftEntity,
  EntityInstance: DraftEntityInstance,

  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  ContentState,
  SelectionState,

  Modifier: DraftModifier,
  RichUtils: RichTextEditorUtil,

  convertFromRaw: convertFromRawToDraftState,
  convertToRaw: convertFromDraftStateToRaw,
  genKey: generateBlockKey,
};

module.exports = DraftPublic;
