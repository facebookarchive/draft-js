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

'use strict';

jest.disableAutomock();

const {insertAtomicBlock, moveAtomicBlockBefore, moveAtomicBlockAfter} = require('AtomicBlockUtils');
const EditorState = require('EditorState');

const getSampleStateForTesting = require('getSampleStateForTesting');

describe('AtomicBlockUtils', () => {
  const {
    editorState,
    contentState,
    selectionState,
  } = getSampleStateForTesting();
  const originalFirstBlock = contentState.getBlockMap().first();
  const entityKey = 'abc';
  const character = ' ';

  function assertAtomicBlock(block) {
    expect(block.getType()).toBe('atomic');
    expect(block.getText()).toBe(character);
    expect(block.getCharacterList().first().getEntity()).toBe(entityKey);
  }

  describe('Collapsed cursor', () => {
    it('must insert atomic at start of block', () => {
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      // Empty block inserted above content.
      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe('unstyled');
      expect(firstBlock.getText()).toBe('');

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getText()).toBe(originalFirstBlock.getText());
    });

    it('must insert atomic within a block, via split', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: 2,
        focusOffset: 2,
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(
        firstBlock.getText()
      ).toBe(
        originalFirstBlock.getText().slice(0, 2)
      );

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe(originalFirstBlock.getText().slice(2));
    });

    it('must insert atomic after a block', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: originalFirstBlock.getLength(),
        focusOffset: originalFirstBlock.getLength(),
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(firstBlock.getText()).toBe(originalFirstBlock.getText());

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe('');
    });

    it('must move atomic to the top', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: 0,
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block to the top
      const atomicResultEditor = moveAtomicBlockBefore(
        atomicEditor,
        firstBlock
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType(), 'move-block');

      // Atomic block must be on the first position now
      const atomicResultFirstBlock = atomicResultContent.getBlockMap().first();
      assertAtomicBlock(atomicResultFirstBlock);
    });

    it('mustn\'t move atomic next to itself', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: 0,
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block above itself
      expect(
        function() {
          moveAtomicBlockBefore(
            atomicEditor,
            atomicBlock
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself
      expect(
        function() {
          moveAtomicBlockAfter(
            atomicEditor,
            atomicBlock
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));
    });

    it('must move atomic to the bottom', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: 0,
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block to the bottom
      const atomicResultEditor = moveAtomicBlockAfter(
        atomicEditor,
        lastBlock
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType(), 'move-block');

      // Atomic block must be on the last position now
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();
      assertAtomicBlock(atomicResultLastBlock);
    });
  });

  describe('Non-collapsed cursor', () => {
    it('must insert atomic at start of block', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: 0,
        focusOffset: 2,
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(firstBlock.getText()).toBe('');

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe(originalFirstBlock.getText().slice(2));
    });

    it('must insert atomic within a block', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: 1,
        focusOffset: 2,
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(
        firstBlock.getText()
      ).toBe(
        originalFirstBlock.getText().slice(0, 1)
      );

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe(originalFirstBlock.getText().slice(2));
    });

    it('must insert atomic at end of block', () => {
      const origLength = originalFirstBlock.getLength();
      const targetSelection = selectionState.merge({
        anchorOffset: origLength - 2,
        focusOffset: origLength,
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(
        firstBlock.getText()
      ).toBe(
        originalFirstBlock.getText().slice(0, origLength - 2)
      );

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe('');
    });

    it('must insert atomic for cross-block selection', () => {
      const originalThirdBlock = contentState.getBlockMap().skip(2).first();

      const targetSelection = selectionState.merge({
        anchorOffset: 2,
        focusKey: originalThirdBlock.getKey(),
        focusOffset: 2,
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      expect(firstBlock.getType()).toBe(originalFirstBlock.getType());
      expect(
        firstBlock.getText()
      ).toBe(
        originalFirstBlock.getText().slice(0, 2)
      );

      const secondBlock = resultContent.getBlockMap().skip(1).first();
      assertAtomicBlock(secondBlock);

      // Third block gets original first block's type, but sliced text from
      // original second block.
      const thirdBlock = resultContent.getBlockMap().skip(2).first();
      expect(thirdBlock.getType()).toBe(originalFirstBlock.getType());
      expect(thirdBlock.getText()).toBe(originalThirdBlock.getText().slice(2));
    });

    it('must move atomic to the top', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: atomicBlock.getLength(),
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block to the top
      const atomicResultEditor = moveAtomicBlockBefore(
        atomicEditor,
        firstBlock
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType(), 'move-block');

      // Atomic block must be on the first position now
      const atomicResultFirstBlock = atomicResultContent.getBlockMap().first();
      assertAtomicBlock(atomicResultFirstBlock);
    });

    it('mustn\'t move atomic next to itself', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: atomicBlock.getLength(),
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block above itself
      expect(
        function() {
          moveAtomicBlockBefore(
            atomicEditor,
            atomicBlock
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself
      expect(
        function() {
          moveAtomicBlockAfter(
            atomicEditor,
            atomicBlock
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));
    });

    it('must move atomic to the bottom', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      const atomicSelection = selectionState.merge({
        anchorKey: atomicBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: atomicBlock.getLength(),
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Move atomic block to the bottom
      const atomicResultEditor = moveAtomicBlockAfter(
        atomicEditor,
        lastBlock
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType(), 'move-block');

      // Atomic block must be on the last position now
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();
      assertAtomicBlock(atomicResultLastBlock);
    });

    it('mustn\'t move atomic for cross-block selection', () => {
      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      const atomicSelection = selectionState.merge({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: atomicBlock.getKey(),
        focusOffset: atomicBlock.getLength(),
      });
      const atomicEditor = EditorState.forceSelection(
        resultEditor,
        atomicSelection
      );

      // Try to move atomic block to the top
      expect(function() {
        moveAtomicBlockBefore(
          atomicEditor,
          firstBlock
        );
      }).toThrow(
        new Error('Selection range must be within same block.')
      );

      // Try to move atomic block to the bottom
      expect(function() {
        moveAtomicBlockAfter(
          atomicEditor,
          lastBlock
        );
      }).toThrow(
        new Error('Selection range must be within same block.')
      );
    });
  });
});
