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

'use strict';

jest.disableAutomock();

const getSampleStateForTesting = require('getSampleStateForTesting');
const removeRangeFromContentState = require('removeRangeFromContentState');

const {contentState, selectionState} = getSampleStateForTesting();

const assertRemoveRangeFromContentState = selection => {
  expect(
    removeRangeFromContentState(contentState, selection).getBlockMap(),
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
