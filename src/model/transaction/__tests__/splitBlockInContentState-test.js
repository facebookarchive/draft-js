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

jest.mock('generateRandomKey');

const getSampleStateForTesting = require('getSampleStateForTesting');
const splitBlockInContentState = require('splitBlockInContentState');

const {contentState, selectionState} = getSampleStateForTesting();

const assertSplitBlockInContentState = selection => {
  expect(
    splitBlockInContentState(contentState, selection)
      .getBlockMap()
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
