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
const {onBackspace, onDelete, onTab} = NestedRichTextEditorUtil;

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
// TODO (T32099101)
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
// TODO (T32099101)
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

// TODO (T32099101)
test('onBackspace on the start of a leaf unstyled block should remove block and merge text to previous leaf', () => {
  expect(true).toBe(true);
});

test('onDelete is a no-op if its at the end of the blockMap', () => {
  const lastContentBlock = contentBlockNodes[contentBlockNodes.length - 1];
  const lastContentBlockKey = lastContentBlock.getKey();
  const endOfLastContentBlock = lastContentBlock.getLength();
  assertNestedUtilOperation(editorState => onDelete(editorState), {
    anchorKey: lastContentBlockKey,
    anchorOffset: endOfLastContentBlock,
    focusKey: lastContentBlockKey,
    focusOffset: lastContentBlockKey,
  });
});

// NOTE: We may implement this in the future
test('onDelete is a no-op the end of a leaf', () => {
  const someLeafBlock = contentBlockNodes[3];
  const someLeafBlockKey = someLeafBlock.getKey();
  const endOfSomeLeafBlock = someLeafBlock.getLength();
  assertNestedUtilOperation(editorState => onDelete(editorState), {
    anchorKey: someLeafBlockKey,
    anchorOffset: endOfSomeLeafBlock,
    focusKey: someLeafBlockKey,
    focusOffset: endOfSomeLeafBlock,
  });
});

/**
 * Tests for onTab
 */
const contentBlockNodes2 = [
  new ContentBlockNode({
    key: 'A',
    nextSibling: 'B',
    text: 'Item 1',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'B',
    prevSibling: 'A',
    nextSibling: 'C',
    text: 'Item 2',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'C',
    prevSibling: 'B',
    nextSibling: 'J',
    text: '',
    type: 'ordered-list-item',
    children: List(['D', 'E', 'F', 'I']),
  }),
  new ContentBlockNode({
    key: 'D',
    parent: 'C',
    prevSibling: null,
    nextSibling: 'E',
    text: 'Item 2a',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'C',
    prevSibling: 'D',
    nextSibling: 'F',
    text: 'Item 2b',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'F',
    parent: 'C',
    prevSibling: 'E',
    nextSibling: 'I',
    text: '',
    type: 'ordered-list-item',
    children: List(['G', 'H']),
  }),
  new ContentBlockNode({
    key: 'G',
    parent: 'F',
    prevSibling: null,
    nextSibling: 'H',
    text: 'Item 2b i',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'H',
    parent: 'F',
    prevSibling: 'G',
    nextSibling: null,
    text: 'Item 2b ii',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'I',
    parent: 'C',
    prevSibling: 'F',
    nextSibling: null,
    text: 'Item 2c',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'J',
    prevSibling: 'C',
    nextSibling: null,
    text: 'Item 3',
    type: 'ordered-list-item',
    children: List([]),
  }),
];

test('onTab with leaf as previous block & non-leaf as next block merges to the next block', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 2),
    {
      anchorKey: 'E',
      focusKey: 'E',
    },
    contentBlockNodes2,
  );
});

test('onTab with non-leaf as previous block merges to the previous block', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 2),
    {
      anchorKey: 'I',
      focusKey: 'I',
    },
    contentBlockNodes2,
  );
});

test('onTab with no previous block does nothing', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 1),
    {
      anchorKey: 'A',
      focusKey: 'A',
    },
    contentBlockNodes2,
  );
});

test('onTab when siblings are at the same depth creates a new parent', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 1),
    {
      anchorKey: 'H',
      focusKey: 'H',
    },
    contentBlockNodes2,
  );
});

const contentBlockNodes3 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B']),
    prevSibling: 'A',
    nextSibling: 'C',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: null,
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: 'X',
    nextSibling: 'Y',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Y',
    parent: null,
    text: '',
    children: Immutable.List(['D', 'E']),
    prevSibling: 'C',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'D',
    parent: 'Y',
    text: 'delta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'E',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'Y',
    text: 'epsilon',
    children: Immutable.List([]),
    prevSibling: 'D',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
];

test('onTab when both siblings are non-leaf merges blocks 1', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 1),
    {
      anchorKey: 'C',
      focusKey: 'C',
    },
    contentBlockNodes3,
  );
});

const contentBlockNodes4 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'Y']),
    prevSibling: 'A',
    nextSibling: 'D',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'Y',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Y',
    parent: 'X',
    text: '',
    children: Immutable.List(['C']),
    prevSibling: 'B',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'Y',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'D',
    parent: null,
    text: 'delta',
    children: Immutable.List([]),
    prevSibling: 'X',
    nextSibling: 'Z',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Z',
    parent: null,
    text: '',
    children: Immutable.List(['E']),
    prevSibling: 'D',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'Z',
    text: 'epsilon',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
    type: 'ordered-list-item',
  }),
];

test('onTab when both siblings are non-leaf merges blocks 2', () => {
  assertNestedUtilOperation(
    editorState => onTab({preventDefault: () => {}}, editorState, 1),
    {
      anchorKey: 'D',
      focusKey: 'D',
    },
    contentBlockNodes4,
  );
});

test('onTab (untab) on a block with no parent does nothing', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 1),
    {
      anchorKey: 'B',
      focusKey: 'B',
    },
    contentBlockNodes2,
  );
});

test('onTab (untab) on a first child moves block as previous sibling of parent', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 2),
    {
      anchorKey: 'D',
      focusKey: 'D',
    },
    contentBlockNodes2,
  );
});

test('onTab (untab) on a last child moves block as next sibling of parent', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 2),
    {
      anchorKey: 'H',
      focusKey: 'H',
    },
    contentBlockNodes2,
  );
});

const contentBlockNodes5 = [
  new ContentBlockNode({
    key: 'A',
    nextSibling: 'X',
    text: 'alpha',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'X',
    prevSibling: 'A',
    nextSibling: 'G',
    text: '',
    type: 'ordered-list-item',
    children: List(['B', 'C', 'D', 'E', 'F']),
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    prevSibling: null,
    nextSibling: 'C',
    text: 'beta',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'X',
    prevSibling: 'B',
    nextSibling: 'D',
    text: 'charlie',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'D',
    parent: 'X',
    prevSibling: 'C',
    nextSibling: 'E',
    text: 'delta',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'X',
    prevSibling: 'D',
    nextSibling: 'F',
    text: 'epsilon',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'F',
    parent: 'X',
    prevSibling: 'E',
    nextSibling: null,
    text: 'foo',
    type: 'ordered-list-item',
    children: List([]),
  }),
  new ContentBlockNode({
    key: 'G',
    prevSibling: 'X',
    nextSibling: null,
    text: 'gamma',
    type: 'ordered-list-item',
    children: List([]),
  }),
];

test('onTab (untab) on a middle child splits the block at that child', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 2),
    {
      anchorKey: 'E',
      focusKey: 'E',
    },
    contentBlockNodes5,
  );
});

const contentBlockNodes6 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'Y']),
    prevSibling: 'A',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'Y',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Y',
    parent: 'X',
    text: '',
    children: Immutable.List(['C']),
    prevSibling: 'B',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'Y',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: null,
    type: 'ordered-list-item',
  }),
];

test('onTab (untab) unnests non-leaf next sibling', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 2),
    {
      anchorKey: 'B',
      focusKey: 'B',
    },
    contentBlockNodes6,
  );
});

const contentBlockNodes7 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'Y', 'E']),
    prevSibling: 'A',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'Y',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Y',
    parent: 'X',
    text: '',
    children: Immutable.List(['C', 'D']),
    prevSibling: 'B',
    nextSibling: 'E',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'Y',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'D',
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'D',
    parent: 'Y',
    text: 'delta',
    children: Immutable.List([]),
    prevSibling: 'C',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'X',
    text: 'epsilon',
    children: Immutable.List([]),
    prevSibling: 'Y',
    nextSibling: null,
    type: 'ordered-list-item',
  }),
];

test('onTab (untab) merges adjacent non-leaf blocks', () => {
  assertNestedUtilOperation(
    editorState =>
      onTab({preventDefault: () => {}, shiftKey: true}, editorState, 2),
    {
      anchorKey: 'B',
      focusKey: 'B',
    },
    contentBlockNodes7,
  );
});

// Some backspace operations have similar behavior to untab
const contentBlockNodes8 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    depth: 0,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'C']),
    prevSibling: 'A',
    nextSibling: null,
    depth: 0,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'C',
    depth: 1,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'X',
    text: '',
    children: Immutable.List([]),
    prevSibling: 'B',
    nextSibling: null,
    depth: 1,
    type: 'unordered-list-item',
  }),
];

test('onBackspace at start of nested block unnests it 1', () => {
  assertNestedUtilOperation(
    editorState => onBackspace(editorState),
    {
      anchorKey: 'C',
      focusKey: 'C',
      anchorOffset: 0,
      focusOffset: 0,
    },
    contentBlockNodes8,
  );
});

const contentBlockNodes9 = [
  new ContentBlockNode({
    key: 'A',
    parent: null,
    text: 'alpha',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'X',
    depth: 0,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'X',
    parent: null,
    text: '',
    children: Immutable.List(['B', 'Y']),
    prevSibling: 'A',
    nextSibling: null,
    depth: 0,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'B',
    parent: 'X',
    text: 'beta',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'Y',
    depth: 1,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'Y',
    parent: 'X',
    text: '',
    children: Immutable.List(['C', 'D']),
    prevSibling: 'B',
    nextSibling: null,
    depth: 1,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'Y',
    text: 'charlie',
    children: Immutable.List([]),
    prevSibling: null,
    nextSibling: 'D',
    depth: 2,
    type: 'unordered-list-item',
  }),
  new ContentBlockNode({
    key: 'D',
    parent: 'Y',
    text: '',
    children: Immutable.List([]),
    prevSibling: 'C',
    nextSibling: null,
    depth: 2,
    type: 'unordered-list-item',
  }),
];

test('onBackspace at start of nested block unnests it 2', () => {
  assertNestedUtilOperation(
    editorState => onBackspace(editorState),
    {
      anchorKey: 'D',
      focusKey: 'D',
      anchorOffset: 0,
      focusOffset: 0,
    },
    contentBlockNodes9,
  );
});

// TODO (T32099101)
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
