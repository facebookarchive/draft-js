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

const EditorState = require('EditorState');

const NestedTextEditorUtil = require('NestedTextEditorUtil');
const getSampleStateForTestingNestedBlocks = require('getSampleStateForTestingNestedBlocks');

describe('NestedTextEditorUtil', () => {
  const {
    editorState,
    selectionState
  } = getSampleStateForTestingNestedBlocks();

  describe('onBackspace', () => {
    const {
      onBackspace
    } = NestedTextEditorUtil;

    it('does not handle non-zero-offset or non-collapsed selections', () => {
      const nonZero = selectionState.merge({
        anchorKey: 'b/c',
        focusKey: 'b/c',
        anchorOffset: 7,
        focusOffset: 7
      });
      expect(
        onBackspace(EditorState.forceSelection(editorState, nonZero))
      ).toBe(
        null
      );

      const nonCollapsed = nonZero.merge({
        anchorOffset: 0
      });
      expect(
        onBackspace(EditorState.forceSelection(editorState, nonCollapsed))
      ).toBe(
        null
      );
    });

    it('does not handle if the previous block is not its parent', () => {
      const nonFirstChild = selectionState.merge({
        anchorKey: 'b/d',
        focusKey: 'b/d',
        anchorOffset: 0,
        focusOffset: 0
      });

      expect(
        onBackspace(EditorState.forceSelection(editorState, nonFirstChild))
      ).toBe(
        null
      );
    });

    it('backspace on the start of a leaf block should remove block and merge text to previous leaf', () => {
      const contentState = editorState.getCurrentContent();
      const targetBlock = contentState.getBlockForKey('a');
      const oldBlock = contentState.getBlockForKey('b/c');

      const firstChildLeaf = selectionState.merge({
        anchorKey: 'b/c',
        focusKey: 'b/c',
        anchorOffset: 0,
        focusOffset: 0
      });

      const deletedState = onBackspace(
        EditorState.forceSelection(editorState, firstChildLeaf)
      );
      const newContentState = deletedState.getCurrentContent();
      const transformedTargetBlock = newContentState.getBlockForKey('a');

      const expectedText = targetBlock.getText() + oldBlock.getText();

      expect(
        transformedTargetBlock.getText()
      ).toBe(
        expectedText
      );

      expect(
        newContentState.getBlockForKey('b/c')
      ).toBe(
        undefined
      );
    });
  });

  describe('onDelete', () => {
    const {
      onDelete
    } = NestedTextEditorUtil;

    it('does not handle non-block-end or non-collapsed selections', () => {
      const nonBlockEnd = selectionState.merge({
        anchorKey: 'a',
        focusKey: 'a',
        anchorOffset: 0,
        focusOffset: 0
      });
      expect(
        onDelete(EditorState.forceSelection(editorState, nonBlockEnd))
      ).toBe(
        null
      );

      const nonCollapsed = nonBlockEnd.merge({
        anchorOffset: 5,
      });
      expect(
        onDelete(EditorState.forceSelection(editorState, nonCollapsed))
      ).toBe(
        null
      );
    });

    it('does not handle if it is the last block on the blockMap', () => {
      const lastBlock = selectionState.merge({
        anchorKey: 'f',
        focusKey: 'f',
        anchorOffset: 7,
        focusOffset: 7
      });
      expect(
        onDelete(EditorState.forceSelection(editorState, lastBlock))
      ).toBe(
        null
      );
    });

    it('does not handle if the next block has no children', () => {
      const noChildrenSelection = selectionState.merge({
        anchorKey: 'b/d/e',
        focusKey: 'b/d/e',
        anchorOffset: 4,
        focusOffset: 4
      });
      expect(
        onDelete(EditorState.forceSelection(editorState, noChildrenSelection))
      ).toBe(
        null
      );
    });

    it('delete on the end of a leaf block should remove block and merge text to previous leaf', () => {
      const contentState = editorState.getCurrentContent();
      const targetBlock = contentState.getBlockForKey('a');
      const oldBlock = contentState.getBlockForKey('b/c');

      const firstChildLeaf = selectionState.merge({
        anchorKey: 'a',
        focusKey: 'a',
        anchorOffset: targetBlock.getLength(),
        focusOffset: targetBlock.getLength()
      });

      const deletedState = onDelete(
        EditorState.forceSelection(editorState, firstChildLeaf)
      );
      const newContentState = deletedState.getCurrentContent();
      const transformedTargetBlock = newContentState.getBlockForKey('a');

      const expectedText = targetBlock.getText() + oldBlock.getText();

      expect(
        transformedTargetBlock.getText()
      ).toBe(
        expectedText
      );

      expect(
        newContentState.getBlockForKey('b/c')
      ).toBe(
        undefined
      );
    });
  });

  describe('toggleBlockType', () => {
    const {
      toggleBlockType,
      DefaultBlockRenderMap
    } = NestedTextEditorUtil;

    it('does not handle non nesting enabled blocks', () => {
      const nestingDisabledBlock = selectionState.merge({
        anchorKey: 'a',
        focusKey: 'a'
      });
      const selectedBlockState = EditorState.forceSelection(
        editorState,
        nestingDisabledBlock
      );
      expect(
        toggleBlockType(
          selectedBlockState,
          'header-two',
          DefaultBlockRenderMap
        ).editorState
      ).toBe(
        selectedBlockState
      );
    });

    it('does not handle nesting enabled blocks with same blockType', () => {
      const nestingDisabledBlock = selectionState.merge({
        anchorKey: 'b',
        focusKey: 'b'
      });
      const selectedBlockState = EditorState.forceSelection(
        editorState,
        nestingDisabledBlock
      );
      expect(
        toggleBlockType(
          selectedBlockState,
          'blockquote',
          DefaultBlockRenderMap
        ).editorState
      ).toBe(
        selectedBlockState
      );
    });

    // Example:
    //
    // Having the cursor on the H1 and trying to change blocktype to unordered-list
    // it should not update h1 instead it should udate its parent block type
    //
    // ordered-list > h1
    // should become
    // unordered-list > h1
    it('should change parent block type when changing type for same tag element', () => {
      const selectedBlock = selectionState.merge({
        anchorKey: 'b/d/e',
        focusKey: 'b/d/e'
      });
      const selectedBlockState = EditorState.forceSelection(
        editorState,
        selectedBlock
      );
      const toggledState = toggleBlockType(
          selectedBlockState,
          'ordered-list-item',
          DefaultBlockRenderMap
      ).editorState;

      const parentBlockType = editorState.getCurrentContent().getBlockForKey('b/d');
      const updatedParentBlockType = toggledState.getCurrentContent().getBlockForKey('b/d');

      expect(parentBlockType.getType()).toBe('unordered-list-item');
      expect(updatedParentBlockType.getType()).toBe('ordered-list-item');
    });

    // Example:
    //
    // Changing the block type inside a nested enable block that has text should
    // transfer it's text to a nested unstyled block example
    //
    // blockquote > ordered-list-item
    // should become
    // blockquote > ordered-list-item > unstyled
    //
    it('should retain parent type and create a new nested block with text from parent', () => {
      const targetBlockKey = 'b/d';
      const selectedBlock = selectionState.merge({
        anchorKey: targetBlockKey,
        focusKey: targetBlockKey,
        focusOffset: 0,
        anchorOffset: 0
      });
      const selectedBlockState = EditorState.forceSelection(
        editorState,
        selectedBlock
      );
      const toggledState = toggleBlockType(
          selectedBlockState,
          'unstyled',
          DefaultBlockRenderMap
      ).editorState;

      const oldContentState = editorState.getCurrentContent();
      const newContentState = toggledState.getCurrentContent();

      const initialBlock = oldContentState.getBlockForKey(targetBlockKey);
      const updatedBlock = newContentState.getBlockForKey(targetBlockKey);
      const newBlock = newContentState.getBlockAfter(targetBlockKey);

      expect(oldContentState.getBlockChildren(targetBlockKey).size).toBe(1);
      expect(newContentState.getBlockChildren(targetBlockKey).size).toBe(2);
      expect(initialBlock.getType()).toBe(updatedBlock.getType());
      expect(updatedBlock.getText()).toBe('');
      expect(newBlock.getText()).toBe(initialBlock.getText());
      expect(newBlock.getType()).toBe('unstyled');
    });
  });

  describe('onSplitParent', () => {
    const {
      onSplitParent,
      DefaultBlockRenderMap
    } = NestedTextEditorUtil;

    const contentState = editorState.getCurrentContent();

    it('must split a nested block retaining parent', () => {
      const selectedBlock = selectionState.merge({
        anchorKey: 'b/d',
        focusKey: 'b/d',
        focusOffset: 0,
        anchorOffset: 0
      });
      const selectedBlockState = EditorState.forceSelection(
        editorState,
        selectedBlock
      );
      const afterSplit = onSplitParent(selectedBlockState, DefaultBlockRenderMap).getCurrentContent();
      const afterBlockMap = afterSplit.getBlockMap();
      const initialBlock = contentState.getBlockForKey('b/d');
      const splittedBlock = afterSplit.getBlockForKey('b/d');
      const newBlock = afterSplit.getBlockAfter('b/d');

      expect(editorState.getCurrentContent().getBlockMap().size).toBe(6);
      expect(afterBlockMap.size).toBe(7);

      expect(splittedBlock.getText()).toBe('');
      expect(splittedBlock.getType()).toBe(initialBlock.getType());
      expect(newBlock.getText()).toBe(initialBlock.getText());
      expect(newBlock.getType()).toBe('unstyled');
      expect(newBlock.getParentKey()).toBe(initialBlock.getParentKey());
    });
  });
});
