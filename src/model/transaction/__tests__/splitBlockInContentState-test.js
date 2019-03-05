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

jest.disableAutomock();

jest.mock('generateRandomKey');

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');
const splitBlockInContentState = require('splitBlockInContentState');

const {List} = Immutable;

const {contentState, selectionState} = getSampleStateForTesting();

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
const treeContentState = contentState.set(
  'blockMap',
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
  const SPLIT_OFFSET = contentState
    .getBlockMap()
    .first()
    .getLength();

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

test('must convert empty list item ContentBlock to unstyled rather than split', () => {
  assertSplitBlockInContentState(
    treeSelectionState.merge({
      anchorOffset: 0,
      focusOffset: 0,
      anchorKey: 'H',
      focusKey: 'H',
    }),
    treeContentState,
  );
});
