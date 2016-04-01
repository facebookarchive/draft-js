/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule MediaUtils
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const Immutable = require('immutable');

const generateRandomKey = require('generateRandomKey');

const {
  List,
  Repeat,
} = Immutable;

const MediaUtils = {
  insertMedia: function(
    editorState: EditorState,
    entityKey: string,
    character: string
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const afterRemoval = DraftModifier.removeRange(
      contentState,
      selectionState,
      'backward'
    );

    const targetSelection = afterRemoval.getSelectionAfter();
    const afterSplit = DraftModifier.splitBlock(afterRemoval, targetSelection);
    const insertionTarget = afterSplit.getSelectionAfter();

    const asMedia = DraftModifier.setBlockType(
      afterSplit,
      insertionTarget,
      'media'
    );

    const charData = CharacterMetadata.create({entity: entityKey});

    const fragmentArray = [
      new ContentBlock({
        key: generateRandomKey(),
        type: 'media',
        text: character,
        characterList: List(Repeat(charData, character.length)),
      }),
      new ContentBlock({
        key: generateRandomKey(),
        type: 'unstyled',
        text: '',
        characterList: List(),
      }),
    ];

    const fragment = BlockMapBuilder.createFromArray(fragmentArray);

    const withMedia = DraftModifier.replaceWithFragment(
      asMedia,
      insertionTarget,
      fragment
    );

    const newContent = withMedia.merge({
      selectionBefore: selectionState,
      selectionAfter: withMedia.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'insert-fragment');
  },
};

module.exports = MediaUtils;
