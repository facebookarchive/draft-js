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

const SelectionState = require('SelectionState');

const applyEntityToContentState = require('applyEntityToContentState');
const getSampleStateForTesting = require('getSampleStateForTesting');

const {contentState, selectionState} = getSampleStateForTesting();

const initialBlock = contentState.getBlockMap().first();
const secondBlock = contentState.getBlockAfter(initialBlock.getKey());

const selectBlock = new SelectionState({
  anchorKey: initialBlock.getKey(),
  anchorOffset: 0,
  focusKey: initialBlock.getKey(),
  focusOffset: initialBlock.getLength(),
});

const selectAdjacentBlocks = new SelectionState({
  anchorKey: initialBlock.getKey(),
  anchorOffset: 0,
  focusKey: secondBlock.getKey(),
  focusOffset: secondBlock.getLength(),
});

const assertApplyEntityToContentState = (
  entityKey,
  selection = selectionState,
  content = contentState,
) => {
  expect(
    applyEntityToContentState(content, selection, entityKey)
      .getBlockMap()
      .toJS(),
  ).toMatchSnapshot();
};

test('must apply entity key', () => {
  assertApplyEntityToContentState('x', selectBlock);
});

test('must apply null entity', () => {
  assertApplyEntityToContentState(null, selectBlock);
});

test('must apply entity key accross multiple blocks', () => {
  assertApplyEntityToContentState('x', selectAdjacentBlocks);
});

test('must apply null entity key accross multiple blocks', () => {
  assertApplyEntityToContentState(null, selectAdjacentBlocks);
});
