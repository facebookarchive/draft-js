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

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');
const removeRangeFromContentState = require('removeRangeFromContentState');

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
];
const treeSelectionState = SelectionState.createEmpty('A');
const treeContentState = contentState.set(
  'blockMap',
  BlockMapBuilder.createFromArray(contentBlockNodes),
);

const assertRemoveRangeFromContentState = (
  selection,
  content = contentState,
) => {
  expect(
    removeRangeFromContentState(content, selection)
      .getBlockMap()
      .toJS(),
  ).toMatchSnapshot();
};

const initialBlock = contentState.getBlockMap().first();
const secondBlock = contentState
  .getBlockMap()
  .skip(1)
  .first();
const selectionWithinA = selectionState.set('anchorOffset', 3);
const selectionFromEndOfA = selectionState.merge({
  anchorOffset: initialBlock.getLength(),
  focusOffset: initialBlock.getLength(),
});

test('must return the input ContentState if selection is collapsed', () => {
  assertRemoveRangeFromContentState(selectionState);
});

test('must remove from the beginning of the block', () => {
  // Remove from 0 to 3.
  assertRemoveRangeFromContentState(selectionState.set('focusOffset', 3));
});

test('must remove from within the block', () => {
  // Remove from 2 to 4.
  assertRemoveRangeFromContentState(
    selectionState.merge({
      anchorOffset: 2,
      focusOffset: 4,
    }),
  );
});

test('must remove to the end of the block', () => {
  // Remove from 3 to end.
  assertRemoveRangeFromContentState(
    selectionState.merge({
      anchorOffset: 3,
      focusOffset: contentState
        .getBlockMap()
        .first()
        .getLength(),
    }),
  );
});

test('must remove from the start of A to the start of B', () => {
  // Block B is removed. Its contents replace the contents of block A,
  // while the `type` of block A is preserved.
  assertRemoveRangeFromContentState(selectionState.set('focusKey', 'b'));
});

test('must remove from the start of A to within B', () => {
  // A slice of block B contents replace the contents of block A,
  // while the `type` of block A is preserved. Block B is removed.
  assertRemoveRangeFromContentState(
    selectionState.merge({
      focusKey: 'b',
      focusOffset: 3,
    }),
  );
});

test('must remove from the start of A to the end of B', () => {
  // Block A is effectively just emptied out, while block B is removed.
  assertRemoveRangeFromContentState(
    selectionState.merge({
      focusKey: 'b',
      focusOffset: secondBlock.getLength(),
    }),
  );
});

test('must remove from within A to the start of B', () => {
  assertRemoveRangeFromContentState(selectionWithinA.set('focusKey', 'b'));
});

test('must remove from within A to within B', () => {
  assertRemoveRangeFromContentState(
    selectionWithinA.merge({
      focusKey: 'b',
      focusOffset: 3,
    }),
  );
});

test('must remove from within A to the end of B', () => {
  assertRemoveRangeFromContentState(
    selectionWithinA.merge({
      focusKey: 'b',
      focusOffset: secondBlock.getLength(),
    }),
  );
});

test('must remove from the end of A to the start of B', () => {
  assertRemoveRangeFromContentState(
    selectionFromEndOfA.merge({
      focusKey: 'b',
      focusOffset: 0,
    }),
  );
});

test('must remove from the end of A to within B', () => {
  assertRemoveRangeFromContentState(
    selectionFromEndOfA.merge({
      focusKey: 'b',
      focusOffset: 3,
    }),
  );
});

test('must remove from the end of A to the end of B', () => {
  assertRemoveRangeFromContentState(
    selectionFromEndOfA.merge({
      focusKey: 'b',
      focusOffset: secondBlock.getLength(),
    }),
  );
});

test('must remove blocks entirely within the selection', () => {
  assertRemoveRangeFromContentState(
    selectionState.merge({
      anchorOffset: 3,
      focusKey: 'c',
      focusOffset: 3,
    }),
  );
});

test('must remove E and F entirely when selection is from end of D to end of F on nested blocks', () => {
  assertRemoveRangeFromContentState(
    treeSelectionState.merge({
      anchorKey: 'D',
      focusKey: 'F',
      anchorOffset: contentBlockNodes[3].getLength(),
      focusOffset: contentBlockNodes[5].getLength(),
    }),
    treeContentState,
  );
});

test('must preserve B and C since E has not been removed', () => {
  assertRemoveRangeFromContentState(
    treeSelectionState.merge({
      anchorKey: 'A',
      focusKey: 'D',
      anchorOffset: contentBlockNodes[0].getLength(),
      focusOffset: contentBlockNodes[3].getLength(),
    }),
    treeContentState,
  );
});

test('must remove B and all its children', () => {
  assertRemoveRangeFromContentState(
    treeSelectionState.merge({
      anchorKey: 'A',
      focusKey: 'F',
      anchorOffset: contentBlockNodes[0].getLength(),
      focusOffset: contentBlockNodes[5].getLength(),
    }),
    treeContentState,
  );
});

test('must retain B since F has not been removed', () => {
  assertRemoveRangeFromContentState(
    treeSelectionState.merge({
      anchorKey: 'A',
      focusKey: 'E',
      anchorOffset: contentBlockNodes[0].getLength(),
      focusOffset: contentBlockNodes[4].getLength(),
    }),
    treeContentState,
  );
});

// Simulates having collapsed selection at start of Elephant and hitting backspace
// We expect Elephant will be merged with previous block, Delta
test('must merge D and E when deleting range from end of D to start of E', () => {
  assertRemoveRangeFromContentState(
    treeSelectionState.merge({
      anchorKey: 'D',
      focusKey: 'E',
      anchorOffset: contentBlockNodes[3].getLength(), // end of D
      focusOffset: 0, // start of E
    }),
    treeContentState,
  );
});
