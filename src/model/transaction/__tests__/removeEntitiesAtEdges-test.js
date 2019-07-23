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

const applyEntityToContentBlock = require('applyEntityToContentBlock');
const getSampleStateForTesting = require('getSampleStateForTesting');
const removeEntitiesAtEdges = require('removeEntitiesAtEdges');

const {contentState, selectionState} = getSampleStateForTesting();

const selectionOnEntity = selectionState.merge({
  anchorKey: 'b',
  anchorOffset: 2,
  focusKey: 'b',
  focusOffset: 2,
});

const setEntityMutability = (mutability, content = contentState) => {
  content.getEntityMap().__get = () => ({
    getMutability: () => mutability,
  });
};

const assertRemoveEntitiesAtEdges = (
  selection,
  mutability = 'IMMUTABLE',
  content = contentState,
) => {
  setEntityMutability(mutability, content);
  expect(
    removeEntitiesAtEdges(content, selection)
      .getBlockMap()
      .toJS(),
  ).toMatchSnapshot();
};

test('must not affect blockMap if there are no entities', () => {
  assertRemoveEntitiesAtEdges(selectionState);
});

test('must not remove mutable entities', () => {
  assertRemoveEntitiesAtEdges(selectionOnEntity, 'MUTABLE');
});

test('must remove immutable entities', () => {
  assertRemoveEntitiesAtEdges(selectionOnEntity, 'IMMUTABLE');
});

test('must remove segmented entities', () => {
  assertRemoveEntitiesAtEdges(selectionOnEntity, 'SEGMENTED');
});

test('must not remove if cursor is at start of entity', () => {
  assertRemoveEntitiesAtEdges(
    selectionOnEntity.merge({
      anchorOffset: 0,
      focusOffset: 0,
    }),
  );
});

test('must remove if cursor is within entity', () => {
  assertRemoveEntitiesAtEdges(selectionOnEntity);
});

test('must not remove if cursor is at end of entity', () => {
  const length = contentState.getBlockForKey('b').getLength();
  assertRemoveEntitiesAtEdges(
    selectionOnEntity.merge({
      anchorOffset: length,
      focusOffset: length,
    }),
  );
});

test('must remove for non-collapsed cursor within a single entity', () => {
  assertRemoveEntitiesAtEdges(selectionOnEntity.set('anchorOffset', 1));
});

test('must remove for non-collapsed cursor on multiple entities', () => {
  const block = contentState.getBlockForKey('b');
  const newBlock = applyEntityToContentBlock(block, 3, 5, '456');
  const newBlockMap = contentState.getBlockMap().set('b', newBlock);
  const newContent = contentState.set('blockMap', newBlockMap);

  assertRemoveEntitiesAtEdges(
    selectionOnEntity.merge({
      anchorOffset: 1,
      focusOffset: 4,
    }),
    'IMMUTABLE',
    newContent,
  );
});

test('must ignore an entity that is entirely within the selection', () => {
  const block = contentState.getBlockForKey('b');

  // Remove entity from beginning and end of block.
  let newBlock = applyEntityToContentBlock(block, 0, 1, null);
  newBlock = applyEntityToContentBlock(newBlock, 4, 5, null);

  const newBlockMap = contentState.getBlockMap().set('b', newBlock);
  const newContent = contentState.set('blockMap', newBlockMap);

  assertRemoveEntitiesAtEdges(
    selectionOnEntity.merge({
      anchorOffset: 0,
      focusOffset: 5,
    }),
    'IMMUTABLE',
    newContent,
  );
});

test('must remove entity at start of selection', () => {
  assertRemoveEntitiesAtEdges(
    selectionState.merge({
      anchorKey: 'b',
      anchorOffset: 3,
      focusKey: 'c',
      focusOffset: 3,
    }),
  );
});

test('must remove entity at end of selection', () => {
  assertRemoveEntitiesAtEdges(
    selectionState.merge({
      anchorKey: 'a',
      anchorOffset: 3,
      focusKey: 'b',
      focusOffset: 3,
    }),
  );
});

test('must remove entities at both ends of selection', () => {
  const cBlock = contentState.getBlockForKey('c');
  const len = cBlock.getLength();
  const modifiedC = applyEntityToContentBlock(cBlock, 0, len, '456');
  const newBlockMap = contentState.getBlockMap().set('c', modifiedC);
  const newContent = contentState.set('blockMap', newBlockMap);

  assertRemoveEntitiesAtEdges(
    selectionState.merge({
      anchorKey: 'b',
      anchorOffset: 3,
      focusKey: 'c',
      focusOffset: 3,
    }),
    'IMMUTABLE',
    newContent,
  );
});
