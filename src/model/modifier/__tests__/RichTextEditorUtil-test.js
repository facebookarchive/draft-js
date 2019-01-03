/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

jest.disableAutomock();

const AtomicBlockUtils = require('AtomicBlockUtils');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');

const {editorState, selectionState} = getSampleStateForTesting();
const {
  onBackspace,
  onDelete,
  onTab,
  tryToRemoveBlockStyle,
} = RichTextEditorUtil;

const insertAtomicBlock = targetEditorState => {
  const entityKey = targetEditorState
    .getCurrentContent()
    .createEntity('TEST', 'IMMUTABLE', null)
    .getLastCreatedEntityKey();
  const character = ' ';
  const movedSelection = EditorState.moveSelectionToEnd(targetEditorState);
  return AtomicBlockUtils.insertAtomicBlock(
    movedSelection,
    entityKey,
    character,
  );
};

test('onBackspace does not handle non-zero-offset or non-collapsed selections', () => {
  const nonZero = selectionState.merge({anchorOffset: 2, focusOffset: 2});
  expect(
    onBackspace(EditorState.forceSelection(editorState, nonZero)),
  ).toMatchSnapshot();

  const nonCollapsed = nonZero.merge({anchorOffset: 0});
  expect(
    onBackspace(EditorState.forceSelection(editorState, nonCollapsed)),
  ).toMatchSnapshot();
});

test('onBackspace resets the current block type if empty', () => {
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

  expect(lastBlockNow.toJS()).toMatchSnapshot();
});

test('onBackspace resets the current block type at the start of the first block', () => {
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

  expect(firstBlockNow.toJS()).toMatchSnapshot();
});

test('onBackspace removes a preceding atomic block', () => {
  const blockSizeBeforeRemove = editorState.getCurrentContent().getBlockMap()
    .size;
  const withAtomicBlock = insertAtomicBlock(editorState);
  const afterBackspace = onBackspace(withAtomicBlock);
  const contentState = afterBackspace.getCurrentContent();
  const blockMap = contentState.getBlockMap();
  expect(blockMap.size === blockSizeBeforeRemove + 1).toMatchSnapshot();
  expect(
    blockMap.some(block => block.getType() === 'atomic'),
  ).toMatchSnapshot();
});

test('onDelete does not handle non-block-end or non-collapsed selections', () => {
  const nonZero = selectionState.merge({anchorOffset: 2, focusOffset: 2});
  expect(
    onDelete(EditorState.forceSelection(editorState, nonZero)) === null,
  ).toMatchSnapshot();

  const nonCollapsed = nonZero.merge({anchorOffset: 0});
  expect(
    onDelete(EditorState.forceSelection(editorState, nonCollapsed)) === null,
  ).toMatchSnapshot();
});

test('onDelete removes a following atomic block', () => {
  const blockSizeBeforeRemove = editorState.getCurrentContent().getBlockMap()
    .size;
  const withAtomicBlock = insertAtomicBlock(editorState);
  const content = withAtomicBlock.getCurrentContent();
  const atomicKey = content
    .getBlockMap()
    .find(block => block.getType() === 'atomic')
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
    blockMapAfterDelete.some(block => block.getType() === 'atomic'),
  ).toMatchSnapshot();

  expect(
    blockMapAfterDelete.size === blockSizeBeforeRemove + 1,
  ).toMatchSnapshot();
});

test('tryToRemoveBlockStyleonDelete breaks out of code block on enter two blank lines', () => {
  const blankLine = selectionState.merge({anchorKey: 'e', focusKey: 'e'});
  const withBlankLine = EditorState.forceSelection(editorState, blankLine);

  const afterEnter = tryToRemoveBlockStyle(withBlankLine);
  const lastBlock = afterEnter.getLastBlock();

  expect(lastBlock.toJS()).toMatchSnapshot();
});

describe('onTab on list block', () => {
  const setListBlock = (contentState, type) =>
    DraftModifier.setBlockType(contentState, selectionState, type);
  const changeBlockType = setListItem =>
    EditorState.push(editorState, setListItem, 'change-block-type');
  const getFirstBlockDepth = contentState =>
    contentState
      .getCurrentContent()
      .getFirstBlock()
      .getDepth();
  const addTab = (contentState, maxDepth = 2) =>
    onTab({preventDefault: () => {}}, contentState, maxDepth);

  test('increases the depth of unordered-list-item', () => {
    const contentState = editorState.getCurrentContent();
    const setListItem = setListBlock(contentState, 'unordered-list-item');
    const withListItem = changeBlockType(setListItem);

    const afterFirstTab = addTab(withListItem);
    const depthAfterFirstTab = getFirstBlockDepth(afterFirstTab);

    expect(depthAfterFirstTab).toBe(1);

    const afterSecondTab = addTab(afterFirstTab);
    const depthAfterSecondTab = getFirstBlockDepth(afterSecondTab);

    expect(depthAfterSecondTab).toBe(2);
  });

  test('increases the depth of unordered-list-item', () => {
    const contentState = editorState.getCurrentContent();
    const setListItem = setListBlock(contentState, 'ordered-list-item');
    const withListItem = changeBlockType(setListItem);

    const afterFirstTab = addTab(withListItem);
    const depthAfterFirstTab = getFirstBlockDepth(afterFirstTab);

    expect(depthAfterFirstTab).toBe(1);

    const afterSecondTab = addTab(afterFirstTab);
    const depthAfterSecondTab = getFirstBlockDepth(afterSecondTab);

    expect(depthAfterSecondTab).toBe(2);
  });
});
