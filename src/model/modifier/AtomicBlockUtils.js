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
const generateNestedKey = require('generateNestedKey');

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
    const targetKey = selectionState.getStartKey();
    const targetBlock = contentState.getBlockForKey(targetKey);
    const targetBlockParentKey = targetBlock.getParentKey();

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
        key: targetBlockParentKey ? generateNestedKey(targetBlockParentKey) : generateRandomKey(),
        type: 'atomic',
        text: character,
        characterList: List(Repeat(charData, character.length)),
      }),
      new ContentBlock({
        key: targetBlockParentKey ? generateNestedKey(targetBlockParentKey) : generateRandomKey(),
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
};

module.exports = AtomicBlockUtils;
