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

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const Immutable = require('immutable');

const generateRandomKey = require('generateRandomKey');

const insertBlockBeforeInContentState = require('insertBlockBeforeInContentState');
const insertBlockAfterInContentState = require('insertBlockAfterInContentState');

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
    const targetBlock = afterRemoval.getBlockForKey(
      targetSelection.getFocusKey()
    );

    const charData = CharacterMetadata.create(
      entityKey ? {entity: entityKey} : undefined
    );

    const atomicBlock = new ContentBlock({
      key: generateRandomKey(),
      type: 'atomic',
      text: character,
      characterList: List(Repeat(charData, character.length)),
    });

    var withAtomicBlock;

    if (targetSelection.getStartOffset() === 0) {
      // If the current selection starts at the very beginning of the currently
      // focused block, insert the atomic block before
      withAtomicBlock = insertBlockBeforeInContentState(
        afterRemoval,
        targetSelection,
        atomicBlock
      );
    } else if (targetSelection.getEndOffset() === targetBlock.getLength()) {
      // If the current selection ends at the very end of the currently focused
      // block, insert the atomic block after
      withAtomicBlock = insertBlockAfterInContentState(
        afterRemoval,
        targetSelection,
        atomicBlock
      );
    } else {
      // If the current selection is somewhere in the middle of the currently
      // focused block, split the block apart and insert the atomic block
      // inbetween
      const afterSplit = DraftModifier.splitBlock(
        afterRemoval,
        targetSelection
      );

      withAtomicBlock = insertBlockAfterInContentState(
        afterSplit,
        targetSelection,
        atomicBlock
      );
    }

    const newContent = withAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'insert-fragment');
  },
};

module.exports = AtomicBlockUtils;
