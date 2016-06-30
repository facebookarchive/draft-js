/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule AtomicBlockUtils
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
const moveBlockBeforeInContentState = require('moveBlockBeforeInContentState');
const moveBlockAfterInContentState = require('moveBlockAfterInContentState');

const {
  List,
  Repeat,
} = Immutable;

const AtomicBlockUtils = {
  insertAtomicBlock: function(
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

    const asAtomicBlock = DraftModifier.setBlockType(
      afterSplit,
      insertionTarget,
      'atomic'
    );

    const charData = CharacterMetadata.create({entity: entityKey});

    const fragmentArray = [
      new ContentBlock({
        key: generateRandomKey(),
        type: 'atomic',
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

    const withAtomicBlock = DraftModifier.replaceWithFragment(
      asAtomicBlock,
      insertionTarget,
      fragment
    );

    const newContent = withAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'insert-fragment');
  },

  moveAtomicBlockBefore: function(
    editorState: EditorState,
    contentBlock: ContentBlock
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const withMovedAtomicBlock = moveBlockBeforeInContentState(
      contentState,
      selectionState,
      contentBlock
    );

    const newContent = withMovedAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withMovedAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'change-fragment');
  },
  
  moveAtomicBlockAfter: function(
    editorState: EditorState,
    contentBlock: ContentBlock
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const withMovedAtomicBlock = moveBlockAfterInContentState(
      contentState,
      selectionState,
      contentBlock
    );

    const newContent = withMovedAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withMovedAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'change-fragment');
  },
};

module.exports = AtomicBlockUtils;
