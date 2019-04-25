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

jest.mock('SelectionState');

let contentState;

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');

const SINGLE_BLOCK = [{text: 'Lorem ipsum', key: 'a'}];
const MULTI_BLOCK = [
  {text: 'Four score', key: 'b'},
  {text: 'and seven', key: 'c'},
];

const SelectionState = require('SelectionState');

const createLink = () => {
  return contentState.createEntity('LINK', 'MUTABLE', {uri: 'zombo.com'});
};

const getSample = textBlocks => {
  const contentBlocks = textBlocks.map(block => new ContentBlock(block));
  const blockMap = BlockMapBuilder.createFromArray(contentBlocks);
  return new ContentState({
    blockMap,
    selectionBefore: new SelectionState(),
    selectionAfter: new SelectionState(),
  });
};

beforeEach(() => {
  contentState = ContentState.createFromText('');
  jest.resetModules();
});

test('must create a new instance', () => {
  const state = getSample(SINGLE_BLOCK);
  expect(state instanceof ContentState).toMatchSnapshot();
});

test('must create properly with an empty block array', () => {
  const state = ContentState.createFromBlockArray([]);
  expect(state instanceof ContentState).toMatchSnapshot();
});

test('key fetching must succeed or fail properly', () => {
  const singleBlock = getSample(SINGLE_BLOCK);
  const key = SINGLE_BLOCK[0].key;
  const multiBlock = getSample(MULTI_BLOCK);
  const firstKey = MULTI_BLOCK[0].key;
  const secondKey = MULTI_BLOCK[1].key;

  expect(singleBlock.getKeyAfter(key)).toMatchSnapshot();
  expect(singleBlock.getKeyBefore(key)).toMatchSnapshot();
  expect(singleBlock.getKeyAfter(key)).toMatchSnapshot();

  expect(multiBlock.getKeyBefore(firstKey)).toMatchSnapshot();
  expect(multiBlock.getKeyAfter(firstKey)).toMatchSnapshot();
  expect(multiBlock.getKeyBefore(secondKey)).toMatchSnapshot();
  expect(multiBlock.getKeyAfter(secondKey)).toMatchSnapshot();
});

test('block fetching must retrieve or fail fetching block for key', () => {
  const state = getSample(SINGLE_BLOCK);
  const block = state.getBlockForKey('a');

  expect(block instanceof ContentBlock).toMatchSnapshot();
  expect(block.getText()).toMatchSnapshot();
  expect(state.getBlockForKey('x')).toMatchSnapshot();
});

test('must create entities instances', () => {
  const contentState = createLink();
  expect(typeof contentState.getLastCreatedEntityKey()).toMatchSnapshot();
});

test('must retrieve an entities instance given a key', () => {
  const contentState = createLink();
  const retrieved = contentState.getEntity(
    contentState.getLastCreatedEntityKey(),
  );
  expect(retrieved.toJS()).toMatchSnapshot();
});

test('must throw when retrieving entities for an invalid key', () => {
  const contentState = createLink();
  expect(() => contentState.getEntity('asdfzxcvqweriuop')).toThrow();
});

test('must merge entities data', () => {
  const contentState = createLink();
  const key = contentState.getLastCreatedEntityKey();

  // Merge new property.
  const contentStateWithNewProp = contentState.mergeEntityData(key, {
    foo: 'bar',
  });
  const updatedEntity = contentStateWithNewProp.getEntity(key);

  // Replace existing property.
  const contentStateWithUpdatedProp = contentStateWithNewProp.mergeEntityData(
    key,
    {uri: 'homestarrunner.com'},
  );
  const entityWithNewURI = contentStateWithUpdatedProp.getEntity(key);

  expect(updatedEntity.getData()).toMatchSnapshot();
  expect(entityWithNewURI.getData()).toMatchSnapshot();
});

test('must replace entities data', () => {
  const contentState = createLink();
  const key = contentState.getLastCreatedEntityKey();

  const updatedContentState = contentState.replaceEntityData(key, {
    uri: 'something.com',
    newProp: 'baz',
  });
  const entityWithReplacedData = updatedContentState.getEntity(key);

  expect(entityWithReplacedData.getData()).toMatchSnapshot();
});
