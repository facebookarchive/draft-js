/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

jest.mock('generateRandomKey');

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');
const splitBlockInContentState = require('splitBlockInContentState');

const {List} = Immutable;

const {contentState, selectionState} = getSampleStateForTesting();

const prepareContentWithBlock = (
  block: ContentBlock,
): {|
  contentState: ContentState,
  selectionState: SelectionState,
|} => {
  const contentState = ContentState.createFromBlockArray([block]);
  const selectionState = SelectionState.createEmpty(block.key);
  return {contentState, selectionState};
};

const contentBlockNodes = [
  new ContentBlockNode({
    key: 'A',
    nextSibling: 'B',
    text: 'Alpha',
  }),
  new ContentBlockNode({
    key: 'B',
    prevSibling: 'A',
    nextSibling: 'G',
    children: List(['C', 'F']),
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'C',
    nextSibling: 'F',
    children: List(['D', 'E']),
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'D',
    nextSibling: 'E',
    text: 'Delta',
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'E',
    prevSibling: 'D',
    text: 'Elephant',
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'F',
    prevSibling: 'C',
    text: 'Fire',
  }),
  new ContentBlockNode({
    key: 'G',
    prevSibling: 'B',
    text: 'Gorila',
  }),
  new ContentBlockNode({
    key: 'H',
    prevSibling: 'G',
    text: '',
    type: 'unordered-list-item',
  }),
];
const treeSelectionState = SelectionState.createEmpty('A');
const treeContentState = contentState.setBlockMap(
  BlockMapBuilder.createFromArray(contentBlockNodes),
);

const assertSplitBlockInContentState = (selection, content = contentState) => {
  expect(
    splitBlockInContentState(content, selection)
      .getBlockMap()
      .toIndexedSeq()
      .toJS(),
  ).toMatchSnapshot();
};

test('must be restricted to collapsed selections', () => {
  expect(() => {
    const nonCollapsed = selectionState.set('focusOffset', 1);
    return splitBlockInContentState(contentState, nonCollapsed);
  }).toThrow();

  expect(() => {
    return splitBlockInContentState(contentState, selectionState);
  }).not.toThrow();
});

test('must split at the beginning of a block', () => {
  assertSplitBlockInContentState(selectionState);
});

test('must split within a block', () => {
  const SPLIT_OFFSET = 3;

  assertSplitBlockInContentState(
    selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
  );
});

test('must split at the end of a block', () => {
  const SPLIT_OFFSET = contentState.getBlockMap().first().getLength();

  assertSplitBlockInContentState(
    selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
  );
});

test('must be restricted to collapsed selections for ContentBlocks', () => {
  expect(() => {
    const nonCollapsed = treeSelectionState.set('focusOffset', 1);
    return splitBlockInContentState(treeContentState, nonCollapsed);
  }).toThrow();

  expect(() => {
    return splitBlockInContentState(treeContentState, treeSelectionState);
  }).not.toThrow();
});

test('must be restricted to ContentBlocks that do not have children', () => {
  expect(() => {
    const invalidSelection = treeSelectionState.merge({
      anchorKey: 'B',
      focusKey: 'B',
    });
    return splitBlockInContentState(treeContentState, invalidSelection);
  }).toThrow();
});

test('must split at the beginning of a root ContentBlock', () => {
  assertSplitBlockInContentState(treeSelectionState, treeContentState);
});

test('must split at the beginning of a nested ContentBlock', () => {
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorKey: 'D',
      focusKey: 'D',
    }),
    treeContentState,
  );
});

test('must split within a root ContentBlock', () => {
  const SPLIT_OFFSET = 3;
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
    treeContentState,
  );
});

test('must split within a nested ContentBlock', () => {
  const SPLIT_OFFSET = 3;
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
      anchorKey: 'E',
      focusKey: 'E',
    }),
    treeContentState,
  );
});

test('must split at the end of a root ContentBlock', () => {
  const SPLIT_OFFSET = contentBlockNodes[0].getLength();
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
    treeContentState,
  );
});

test('must split at the end of a nested ContentBlock', () => {
  const SPLIT_OFFSET = contentBlockNodes[3].getLength();
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
      anchorKey: 'D',
      focusKey: 'D',
    }),
    treeContentState,
  );
});

test('must preserve blockquote type when splitting in the middle', () => {
  const block = new ContentBlock({
    text: 'hello',
    type: 'blockquote',
  });
  const {contentState, selectionState} = prepareContentWithBlock(block);
  const SPLIT_OFFSET = 2;

  assertSplitBlockInContentState(
    selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
    contentState,
  );
});

test('must preserve blockquote type when splitting at end', () => {
  const block = new ContentBlock({
    text: 'hello',
    type: 'blockquote',
  });
  const {contentState, selectionState} = prepareContentWithBlock(block);
  const SPLIT_OFFSET = block.getLength();

  assertSplitBlockInContentState(
    selectionState.merge({
      anchorOffset: SPLIT_OFFSET,
      focusOffset: SPLIT_OFFSET,
    }),
    contentState,
  );
});

test('must convert empty blockquote to unstyled rather than splitting', () => {
  const block = new ContentBlock({
    text: '',
    type: 'blockquote',
  });
  const {contentState, selectionState} = prepareContentWithBlock(block);

  assertSplitBlockInContentState(selectionState, contentState);
});

test('must preserve code-block type even when empty', () => {
  const block = new ContentBlock({
    text: '',
    type: 'code-block',
  });
  const {contentState, selectionState} = prepareContentWithBlock(block);

  assertSplitBlockInContentState(selectionState, contentState);
});

test('must preserve list item depth when splitting at the start', () => {
  ['unordered-list-item', 'ordered-list-item'].forEach(listType => {
    const block = new ContentBlock({
      text: 'hello',
      type: listType,
      depth: 1,
    });
    const {contentState, selectionState} = prepareContentWithBlock(block);

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: 0,
      }),
      contentState,
    );
  });
});

test('must preserve list item depth when splitting in the middle', () => {
  ['unordered-list-item', 'ordered-list-item'].forEach(listType => {
    const block = new ContentBlock({
      text: 'hello',
      type: listType,
      depth: 1,
    });
    const {contentState, selectionState} = prepareContentWithBlock(block);
    const SPLIT_OFFSET = 2;

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: SPLIT_OFFSET,
        focusOffset: SPLIT_OFFSET,
      }),
      contentState,
    );
  });
});

test('must preserve list item depth when splitting at the end', () => {
  ['unordered-list-item', 'ordered-list-item'].forEach(listType => {
    const block = new ContentBlock({
      text: 'hello',
      type: listType,
      depth: 1,
    });
    const {contentState, selectionState} = prepareContentWithBlock(block);
    const SPLIT_OFFSET = block.getLength();

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: SPLIT_OFFSET,
        focusOffset: SPLIT_OFFSET,
      }),
      contentState,
    );
  });
});

test('must reduce depth of indented empty list item rather than split', () => {
  ['unordered-list-item', 'ordered-list-item'].forEach(listType => {
    const {contentState, selectionState} = prepareContentWithBlock(
      new ContentBlock({
        text: '',
        type: listType,
        depth: 1,
      }),
    );

    assertSplitBlockInContentState(selectionState, contentState);
  });
});

test('must convert non-indented empty list item to unstyled rather than split', () => {
  ['unordered-list-item', 'ordered-list-item'].forEach(listType => {
    const {contentState, selectionState} = prepareContentWithBlock(
      new ContentBlock({
        text: '',
        type: listType,
        depth: 0,
      }),
    );

    assertSplitBlockInContentState(selectionState, contentState);
  });
});

test('must convert the new block to unstyled when splitting at end of header blocks', () => {
  [
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
  ].forEach(headerType => {
    const headerBlock = new ContentBlock({
      text: 'hello',
      type: headerType,
    });
    const {contentState, selectionState} = prepareContentWithBlock(headerBlock);
    const SPLIT_OFFSET = headerBlock.getLength();

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: SPLIT_OFFSET,
        focusOffset: SPLIT_OFFSET,
      }),
      contentState,
    );
  });
});

test('must preserve header type when splitting at the start of header block', () => {
  [
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
  ].forEach(headerType => {
    const {contentState, selectionState} = prepareContentWithBlock(
      new ContentBlock({
        text: 'hello',
        type: headerType,
      }),
    );

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: 0,
      }),
      contentState,
    );
  });
});

test('must preserve header type when splitting within a header block', () => {
  [
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
  ].forEach(headerType => {
    const {contentState, selectionState} = prepareContentWithBlock(
      new ContentBlock({
        text: 'hello',
        type: headerType,
      }),
    );

    assertSplitBlockInContentState(
      selectionState.merge({
        anchorOffset: 2,
        focusOffset: 2,
      }),
      contentState,
    );
  });
});
