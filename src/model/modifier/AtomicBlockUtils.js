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
const SelectionState = require('SelectionState');
const Immutable = require('immutable');

const generateRandomKey = require('generateRandomKey');
const moveBlockInContentState = require('moveBlockInContentState');

import type {DraftInsertionType} from 'DraftInsertionType';

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

  moveAtomicBlock: function(
    editorState: EditorState,
    atomicBlock: ContentBlock,
    targetRange: SelectionState,
    insertionMode?: DraftInsertionType
  ): EditorState {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    let withMovedAtomicBlock;

    if (insertionMode === 'before' || insertionMode === 'after') {
      const targetBlock = contentState.getBlockForKey(
        insertionMode === 'before' ?
          targetRange.getStartKey() :
          targetRange.getEndKey()
      );

      withMovedAtomicBlock = moveBlockInContentState(
        contentState,
        atomicBlock,
        targetBlock,
        insertionMode
      );
    } else {
      const afterRemoval = DraftModifier.removeRange(
        contentState,
        targetRange,
        'backward'
      );

      const selectionAfterRemoval = afterRemoval.getSelectionAfter();
      const targetBlock = afterRemoval.getBlockForKey(
        selectionAfterRemoval.getFocusKey()
      );

      if (selectionAfterRemoval.getStartOffset() === 0) {
        withMovedAtomicBlock = moveBlockInContentState(
          afterRemoval,
          atomicBlock,
          targetBlock,
          'before'
        );
      } else if (selectionAfterRemoval.getEndOffset() === targetBlock.getLength()) {
        withMovedAtomicBlock = moveBlockInContentState(
          afterRemoval,
          atomicBlock,
          targetBlock,
          'after'
        );
      } else {
        const afterSplit = DraftModifier.splitBlock(
          afterRemoval,
          selectionAfterRemoval
        );

        const selectionAfterSplit = afterSplit.getSelectionAfter();
        const targetBlock = afterSplit.getBlockForKey(
          selectionAfterSplit.getFocusKey()
        );

        withMovedAtomicBlock = moveBlockInContentState(
          afterSplit,
          atomicBlock,
          targetBlock,
          'before'
        );
      }
    }

    const newContent = withMovedAtomicBlock.merge({
      selectionBefore: selectionState,
      selectionAfter: withMovedAtomicBlock.getSelectionAfter().set('hasFocus', true),
    });

    return EditorState.push(editorState, newContent, 'move-block');
  },
};

module.exports = AtomicBlockUtils;
