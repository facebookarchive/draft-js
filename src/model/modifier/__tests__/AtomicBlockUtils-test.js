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

const {insertAtomicBlock, moveAtomicBlock} = require('AtomicBlockUtils');
const EditorState = require('EditorState');
const Entity = require('DraftEntity');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');

describe('AtomicBlockUtils', () => {
  const {
    editorState,
    contentState,
    selectionState,
  } = getSampleStateForTesting();
  const originalFirstBlock = contentState.getBlockMap().first();
  const entityKey = Entity.create('TOKEN', 'MUTABLE');
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

    it('must move atomic at start of block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block at start of the first block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: firstBlock.getKey(),
          focusKey: firstBlock.getKey(),
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the first position now
      const atomicResultFirstBlock = atomicResultContent.getBlockMap().first();
      assertAtomicBlock(atomicResultFirstBlock);
    });

    it('must move atomic at end of block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block at end of the last block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: lastBlock.getKey(),
          anchorOffset: lastBlock.getLength(),
          focusKey: lastBlock.getKey(),
          focusOffset: lastBlock.getLength(),
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the last position now
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();
      assertAtomicBlock(atomicResultLastBlock);
    });

    it('must move atomic inbetween block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const thirdBlock = resultContent.getBlockMap().skip(2).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block inbetween the splitted parts of the third block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: thirdBlock.getKey(),
          anchorOffset: 2,
          focusKey: thirdBlock.getKey(),
          focusOffset: 2,
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be inbetween the splitted block
      const atomicResultSecondBlock = atomicResultContent.getBlockMap().skip(1).first();
      const atomicResultThirdBlock = atomicResultContent.getBlockMap().skip(2).first();
      const atomicResultFourthBlock = atomicResultContent.getBlockMap().skip(3).first();

      expect(atomicResultSecondBlock.getText()).toBe('Al');
      assertAtomicBlock(atomicResultThirdBlock);
      expect(atomicResultFourthBlock.getText()).toBe('pha');
    });

    it('must move atomic before block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block before the first block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: firstBlock.getKey(),
        }),
        'before'
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the first position now
      const atomicResultFirstBlock = atomicResultContent.getBlockMap().first();
      assertAtomicBlock(atomicResultFirstBlock);
    });

    it('must move atomic after block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block after the last block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          focusKey: lastBlock.getKey(),
        }),
        'after'
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the last position now
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();
      assertAtomicBlock(atomicResultLastBlock);
    });

    it('mustn\'t move atomic next to itself', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: originalFirstBlock.getLength(),
        focusOffset: originalFirstBlock.getLength(),
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const beforeAtomicBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const afterAtomicBlock = resultContent.getBlockMap().skip(2).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block above itself by moving it after preceeding block by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: beforeAtomicBlock.getKey(),
              anchorOffset: beforeAtomicBlock.getLength(),
              focusKey: beforeAtomicBlock.getKey(),
              focusOffset: beforeAtomicBlock.getLength(),
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block above itself by moving it after preceeding block
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: beforeAtomicBlock.getKey(),
              focusKey: beforeAtomicBlock.getKey(),
            }),
            'after'
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block above itself by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: atomicBlock.getKey(),
              focusKey: atomicBlock.getKey(),
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block above itself
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: atomicBlock.getKey(),
            }),
            'before'
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself by moving it before following block by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: afterAtomicBlock.getKey(),
              focusKey: afterAtomicBlock.getKey(),
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself by moving it before following block
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: afterAtomicBlock.getKey(),
              focusKey: afterAtomicBlock.getKey(),
            }),
            'before'
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: atomicBlock.getKey(),
              anchorOffset: atomicBlock.getLength(),
              focusKey: atomicBlock.getKey(),
              focusOffset: atomicBlock.getLength(),
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              focusKey: atomicBlock.getKey(),
            }),
            'after'
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));
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

    it('must move atomic at start of block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block at start of the last block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: lastBlock.getKey(),
          anchorOffset: 0,
          focusKey: lastBlock.getKey(),
          focusOffset: 2,
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the second last position now
      const atomicResultSecondLastBlock = atomicResultContent.getBlockMap().reverse().skip(1).first();
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();

      assertAtomicBlock(atomicResultSecondLastBlock);
      expect(atomicResultLastBlock.getText()).toBe('arlie');
    });

    it('must move atomic at end of block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block at end of the last block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: lastBlock.getKey(),
          anchorOffset: lastBlock.getLength() - 2,
          focusKey: lastBlock.getKey(),
          focusOffset: lastBlock.getLength(),
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the last position now
      const atomicResultSecondLastBlock = atomicResultContent.getBlockMap().reverse().skip(1).first();
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();

      expect(atomicResultSecondLastBlock.getText()).toBe('Charl');
      assertAtomicBlock(atomicResultLastBlock);
    });

    it('must move atomic inbetween block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const thirdBlock = resultContent.getBlockMap().skip(2).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block inbetween the splitted parts of the third block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: thirdBlock.getKey(),
          anchorOffset: 1,
          focusKey: thirdBlock.getKey(),
          focusOffset: 2,
        })
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be inbetween the splitted block
      const atomicResultSecondBlock = atomicResultContent.getBlockMap().skip(1).first();
      const atomicResultThirdBlock = atomicResultContent.getBlockMap().skip(2).first();
      const atomicResultFourthBlock = atomicResultContent.getBlockMap().skip(3).first();

      expect(atomicResultSecondBlock.getText()).toBe('A');
      assertAtomicBlock(atomicResultThirdBlock);
      expect(atomicResultFourthBlock.getText()).toBe('pha');
    });

    it('must move atomic before block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block before the first block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: firstBlock.getKey(),
          anchorOffset: 2,
          focusKey: lastBlock.getKey(),
          focusOffset: 2,
        }),
        'before'
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the first position now
      const atomicResultFirstBlock = atomicResultContent.getBlockMap().first();
      assertAtomicBlock(atomicResultFirstBlock);
    });

    it('must move atomic after block', () => {
      // Insert atomic block at the first position
      const resultEditor = insertAtomicBlock(
        editorState,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const firstBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const lastBlock = resultContent.getBlockMap().last();

      assertAtomicBlock(atomicBlock);

      // Move atomic block after the last block
      const atomicResultEditor = moveAtomicBlock(
        resultEditor,
        atomicBlock,
        new SelectionState({
          anchorKey: firstBlock.getKey(),
          anchorOffset: 2,
          focusKey: lastBlock.getKey(),
          focusOffset: 2,
        }),
        'after'
      );
      const atomicResultContent = atomicResultEditor.getCurrentContent();

      expect(atomicResultEditor.getLastChangeType()).toBe('move-block');

      // Atomic block must be on the last position now
      const atomicResultLastBlock = atomicResultContent.getBlockMap().last();
      assertAtomicBlock(atomicResultLastBlock);
    });

    it('mustn\'t move atomic next to itself', () => {
      const targetSelection = selectionState.merge({
        anchorOffset: originalFirstBlock.getLength(),
        focusOffset: originalFirstBlock.getLength(),
      });
      const targetEditor = EditorState.forceSelection(
        editorState,
        targetSelection
      );

      // Insert atomic block at the second position
      const resultEditor = insertAtomicBlock(
        targetEditor,
        entityKey,
        character
      );
      const resultContent = resultEditor.getCurrentContent();

      const beforeAtomicBlock = resultContent.getBlockMap().first();
      const atomicBlock = resultContent.getBlockMap().skip(1).first();
      const afterAtomicBlock = resultContent.getBlockMap().skip(2).first();

      assertAtomicBlock(atomicBlock);

      // Move atomic block above itself by moving it after preceeding block by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: beforeAtomicBlock.getKey(),
              anchorOffset: beforeAtomicBlock.getLength() - 2,
              focusKey: beforeAtomicBlock.getKey(),
              focusOffset: beforeAtomicBlock.getLength(),
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));

      // Move atomic block below itself by moving it before following block by replacement
      expect(
        function() {
          moveAtomicBlock(
            resultEditor,
            atomicBlock,
            new SelectionState({
              anchorKey: afterAtomicBlock.getKey(),
              anchorOffset: 0,
              focusKey: afterAtomicBlock.getKey(),
              focusOffset: 2,
            })
          );
        }
      ).toThrow(new Error('Block cannot be moved next to itself.'));
    });
  });
});
