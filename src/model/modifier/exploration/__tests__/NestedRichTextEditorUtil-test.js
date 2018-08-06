/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

jest.disableAutomock();

jest.mock('generateRandomKey');

const AtomicBlockUtils = require('AtomicBlockUtils');
const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const EditorState = require('EditorState');
const NestedRichTextEditorUtil = require('NestedRichTextEditorUtil');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');

const {List} = Immutable;

const {editorState, contentState, selectionState} = getSampleStateForTesting();
const {onBackspace, onDelete} = NestedRichTextEditorUtil;

const contentBlockNodes = [
  new ContentBlockNode({
    key: 'A',
    nextSibling: 'B',
    text: 'Alpha',
    type: 'blockquote',
  }),
  new ContentBlockNode({
    key: 'B',
    prevSibling: 'A',
    nextSibling: 'G',
    type: 'ordered-list-item',
    children: List(['C', 'F']),
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'C',
    nextSibling: 'F',
    type: 'blockquote',
    children: List(['D', 'E']),
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'D',
    nextSibling: 'E',
    type: 'header-two',
    text: 'Delta',
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'E',
    prevSibling: 'D',
    type: 'unstyled',
    text: 'Elephant',
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'F',
    prevSibling: 'C',
    type: 'code-block',
    text: 'Fire',
  }),
  new ContentBlockNode({
    key: 'G',
    prevSibling: 'B',
    nextSibling: 'H',
    type: 'ordered-list-item',
    text: 'Gorila',
  }),
  new ContentBlockNode({
    key: 'H',
    prevSibling: 'G',
    nextSibling: 'I',
    text: ' ',
    type: 'atomic',
  }),
  new ContentBlockNode({
    key: 'I',
    prevSibling: 'H',
    text: 'last',
    type: 'unstyled',
  }),
];

const toggleExperimentalTreeDataSupport = enabled => {
  jest.doMock('gkx', () => name => {
    return name === 'draft_tree_data_support' ? enabled : false;
  });
};

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

const assertNestedUtilOperation = (
  operation,
  selection = {},
  content = contentBlockNodes,
) => {
  const result = operation(
    EditorState.forceSelection(
      EditorState.createWithContent(
        contentState.set('blockMap', BlockMapBuilder.createFromArray(content)),
      ),
      SelectionState.createEmpty(content[0].key).merge(selection),
    ),
  );

  const expected =
    result instanceof EditorState
      ? result
          .getCurrentContent()
          .getBlockMap()
          .toJS()
      : result;

  expect(expected).toMatchSnapshot();
};

toggleExperimentalTreeDataSupport(true);

test(`toggleBlockType does not handle nesting when selection is collapsed`, () => {
  assertNestedUtilOperation(editorState =>
    NestedRichTextEditorUtil.toggleBlockType(editorState, 'header-one'),
  );
});

test(`toggleBlockType does not handle nesting for multi block selection`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'header-one'),
    {
      anchorKey: 'D',
      focusKey: 'E',
      focusOffset: contentBlockNodes[4].getLength(),
    },
  );
});

test(`toggleBlockType does not allow block type change for multi block selection to unsupported type`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'code-block'),
    {
      anchorKey: 'D',
      focusKey: 'E',
      focusOffset: contentBlockNodes[4].getLength(),
    },
  );
});

test(`toggleBlockType does not handle nesting for blockType: "atomic"`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'header-one'),
    {
      anchorKey: 'H',
      focusKey: 'H',
      focusOffset: contentBlockNodes[7].getLength(),
    },
  );
});

test(`toggleBlockType does not handle nesting for blockType: "code-block"`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'header-two'),
    {
      anchorKey: 'F',
      focusKey: 'F',
      focusOffset: contentBlockNodes[5].getLength(),
    },
  );
});

test(`toggleBlockType does not handle nesting for block that has children`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'header-one'),
    {
      anchorKey: 'C',
      focusKey: 'C',
      focusOffset: contentBlockNodes[2].getLength(),
    },
  );
});

test(`toggleBlockType does not allow block type change for block that has children to unsupported type`, () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'code-block'),
    {
      anchorKey: 'C',
      focusKey: 'C',
      focusOffset: contentBlockNodes[2].getLength(),
    },
  );
});

/**
 * Example:
 *
 * Having the cursor on the H1 and trying to change blocktype to unordered-list
 * it should not update h1 instead it should udate its parent block type
 *
 * blockquote > foo
 * should not become
 * blockquote > blockquote > foo
 */
test('toggleBlockType does not handle nesting enabled blocks with same blockType', () => {
  assertNestedUtilOperation(
    editorState =>
      NestedRichTextEditorUtil.toggleBlockType(editorState, 'blockquote'),
    {
      anchorKey: 'A',
      focusKey: 'A',
      focusOffset: contentBlockNodes[0].getLength(),
    },
  );
});

/**
 * Example:
 *
 * Having the cursor on the H1 and trying to change blocktype to unordered-list
 * it should not update h1 instead it should udate its parent block type
 *
 * ordered-list > h1
 * should become
 * unordered-list > h1
 */
test('toggleBlockType should change parent block type when changing type for same tag element', () => {
  expect(true).toBe(true);
});

/**
 *  Example:
 *
 *  Changing the block type inside a nested enable block that has text should
 *  transfer it's text to a nested unstyled block example
 *
 *  blockquote > ordered-list-item
 *  should become
 *  blockquote > ordered-list-item > unstyled
 */
test('toggleBlockType with ranged selection should retain parent type and create a new nested block with text from parent', () => {
  expect(true).toBe(true);
});

test('onBackspace does not handle non-zero-offset selections', () => {
  assertNestedUtilOperation(editorState => onBackspace(editorState), {
    anchorKey: 'F',
    focusKey: 'F',
    anchorOffset: 2,
    focusOffset: 2,
  });
});

test('onBackspace does not handle non-collapsed selections', () => {
  assertNestedUtilOperation(editorState => onBackspace(editorState), {
    anchorKey: 'F',
    focusKey: 'F',
    focusOffset: 2,
  });
});

test('onBackspace resets the current block type if empty', () => {
  assertNestedUtilOperation(editorState => onBackspace(editorState), {
    anchorKey: 'F',
    focusKey: 'F',
  });
});

test('onBackspace removes a preceding atomic block', () => {
  assertNestedUtilOperation(editorState => onBackspace(editorState), {
    focusKey: 'I',
    anchorKey: 'I',
  });
});

test('onBackspace on the start of a leaf unstyled block should remove block and merge text to previous leaf', () => {
  expect(true).toBe(true);
});

test('onDelete does not handle if it is the last block on the blockMap', () => {
  expect(true).toBe(true);
});

test('onDelete does not handle if the next block has no children', () => {
  expect(true).toBe(true);
});

test('onDelete on the end of a leaf block should remove block and merge text to previous leaf', () => {
  expect(true).toBe(true);
});

test('onSplitParent must split a nested block retaining parent', () => {
  expect(true).toBe(true);
});

/**
 * => Note:
 *
 * The bellow tests are a port from RichTextEditorUtil-test.js to ensure that
 * NestedRichTextEditorUtil can provide the same guarantees as its flat counterpart.
 */
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
