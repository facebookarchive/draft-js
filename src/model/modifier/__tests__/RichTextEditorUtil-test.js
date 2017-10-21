/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

jest.disableAutomock();

const AtomicBlockUtils = require('AtomicBlockUtils');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');

describe('RichTextEditorUtil', () => {
  const {editorState, selectionState} = getSampleStateForTesting();

  function insertAtomicBlock(targetEditorState) {
    const entityKey = targetEditorState.getCurrentContent().createEntity(
      'TEST',
      'IMMUTABLE',
      null,
    ).getLastCreatedEntityKey();
    const character = ' ';
    const movedSelection = EditorState.moveSelectionToEnd(targetEditorState);
    return AtomicBlockUtils.insertAtomicBlock(
      movedSelection,
      entityKey,
      character,
    );
  }

  describe('onBackspace', () => {
    const {onBackspace} = RichTextEditorUtil;

    it('does not handle non-zero-offset or non-collapsed selections', () => {
      const nonZero = selectionState.merge({anchorOffset: 2, focusOffset: 2});
      expect(
        onBackspace(EditorState.forceSelection(editorState, nonZero)),
      ).toBe(
        null,
      );

      const nonCollapsed = nonZero.merge({anchorOffset: 0});
      expect(
        onBackspace(EditorState.forceSelection(editorState, nonCollapsed)),
      ).toBe(
        null,
      );
    });

    it('resets the current block type if empty', () => {
      const contentState = editorState.getCurrentContent();
      const lastBlock = contentState.getLastBlock();
      const lastBlockKey = lastBlock.getKey();

      // Remove the current text from the blockquote.
      const resetBlockquote = DraftModifier.removeRange(
        contentState,
        new SelectionState({
          anchorKey: lastBlockKey,
          anchorOffset: 0,
          focusKey: lastBlockKey,
          focusOffset: lastBlock.getLength(),
        }),
        'backward',
      );

      const withEmptyBlockquote = EditorState.push(
        editorState,
        resetBlockquote,
        'remove-range',
      );

      const afterBackspace = onBackspace(withEmptyBlockquote);
      const lastBlockNow = afterBackspace.getCurrentContent().getLastBlock();

      expect(lastBlockNow.getType()).toBe('unstyled');
      expect(lastBlockNow.getText()).toBe('');
    });

    it('resets the current block type at the start of the first block', () => {
      const contentState = editorState.getCurrentContent();

      const setListItem = DraftModifier.setBlockType(
        contentState,
        selectionState,
        'unordered-list-item',
      );

      const withListItem = EditorState.push(
        editorState,
        setListItem,
        'change-block-type',
      );

      const afterBackspace = onBackspace(withListItem);
      const firstBlockNow = afterBackspace.getCurrentContent().getFirstBlock();

      expect(firstBlockNow.getType()).toBe('unstyled');
    });

    it('removes a preceding atomic block', () => {
      const withAtomicBlock = insertAtomicBlock(editorState);
      const afterBackspace = onBackspace(withAtomicBlock);
      const contentState = afterBackspace.getCurrentContent();
      const blockMap = contentState.getBlockMap();
      expect(blockMap.size).toBe(4);
      expect(
        blockMap.some((block) => block.getType() === 'atomic'),
      ).toBe(
        false,
      );
    });
  });

  describe('onDelete', () => {
    const {onDelete} = RichTextEditorUtil;

    it('does not handle non-block-end or non-collapsed selections', () => {
      const nonZero = selectionState.merge({anchorOffset: 2, focusOffset: 2});
      expect(
        onDelete(EditorState.forceSelection(editorState, nonZero)),
      ).toBe(
        null,
      );

      const nonCollapsed = nonZero.merge({anchorOffset: 0});
      expect(
        onDelete(EditorState.forceSelection(editorState, nonCollapsed)),
      ).toBe(
        null,
      );
    });

    it('removes a following atomic block', () => {
      const withAtomicBlock = insertAtomicBlock(editorState);
      const content = withAtomicBlock.getCurrentContent();
      const atomicKey = content
        .getBlockMap()
        .find((block) => block.getType() === 'atomic')
        .getKey();

      const blockBefore = content.getBlockBefore(atomicKey);
      const keyBefore = blockBefore.getKey();
      const lengthBefore = blockBefore.getLength();

      const withSelectionAboveAtomic = EditorState.forceSelection(
        withAtomicBlock,
        new SelectionState({
          anchorKey: keyBefore,
          anchorOffset: lengthBefore,
          focusKey: keyBefore,
          focusOffset: lengthBefore,
        }),
      );

      const afterDelete = onDelete(withSelectionAboveAtomic);
      const blockMapAfterDelete = afterDelete.getCurrentContent().getBlockMap();

      expect(
        blockMapAfterDelete.some((block) => block.getType() === 'atomic'),
      ).toBe(
        false,
      );

      expect(blockMapAfterDelete.size).toBe(4);
    });
  });
});
