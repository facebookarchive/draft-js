/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

const getEntityKeyForSelection = require('getEntityKeyForSelection');
const getSampleStateForTesting = require('getSampleStateForTesting');

const {contentState, selectionState} = getSampleStateForTesting();

const initialSelectionState = selectionState.merge({
  anchorKey: 'b',
  focusKey: 'b',
});

const COLLAPSED_SELECTION = initialSelectionState.merge({
  anchorOffset: 2,
  focusOffset: 2,
});

const COLLAPSED_SELECTION_ENTITY_END = initialSelectionState.merge({
  anchorOffset: 5,
  focusOffset: 5,
});

const NON_COLLAPSED_SELECTION = initialSelectionState.merge({
  anchorOffset: 2,
  focusKey: 'c',
  focusOffset: 2,
});

const setEntityMutability = (
  mutability:
    | $TEMPORARY$string<'IMMUTABLE'>
    | $TEMPORARY$string<'MUTABLE'>
    | $TEMPORARY$string<'SEGMENTED'>,
) => {
  // $FlowFixMe error encountered when strong-typing ContentState.getEntityMap
  contentState.getEntityMap().__get = () => ({
    getMutability: () => mutability,
  });
};

test('must return null at start of block with collapsed selection', () => {
  const key = getEntityKeyForSelection(contentState, initialSelectionState);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable with collapsed selection', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if mutable with collapsed selection at end of an entity', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(
    contentState,
    COLLAPSED_SELECTION_ENTITY_END,
  );
  expect(key).toMatchSnapshot();
});

test('must not return key if immutable with collapsed selection', () => {
  setEntityMutability('IMMUTABLE');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if segmented with collapsed selection', () => {
  setEntityMutability('SEGMENTED');
  const key = getEntityKeyForSelection(contentState, COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must return null if start is at end of block', () => {
  const startsAtEnd = NON_COLLAPSED_SELECTION.merge({
    anchorOffset: contentState.getBlockForKey('b').getLength(),
  });
  const key = getEntityKeyForSelection(contentState, startsAtEnd);
  expect(key).toMatchSnapshot();
});

test('must return key if mutable', () => {
  setEntityMutability('MUTABLE');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if immutable', () => {
  setEntityMutability('IMMUTABLE');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});

test('must not return key if segmented', () => {
  setEntityMutability('SEGMENTED');
  const key = getEntityKeyForSelection(contentState, NON_COLLAPSED_SELECTION);
  expect(key).toMatchSnapshot();
});
