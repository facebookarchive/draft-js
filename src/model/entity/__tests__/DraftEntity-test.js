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

const ContentState = require('ContentState');

beforeEach(() => {
  jest.resetModules();
});

const createLink = (contentState: ContentState) => {
  const newContentState = contentState.createEntity('LINK', 'MUTABLE', {
    uri: 'zombo.com',
  });
  return {
    contentState: newContentState,
    key: contentState.getLastCreatedEntityKey(),
  };
};

test('must create instances', () => {
  const {key} = createLink(ContentState.createFromText(''));
  expect(typeof key).toMatchSnapshot();
});

test('must retrieve an instance given a key', () => {
  const {key, contentState} = createLink(ContentState.createFromText(''));
  const retrieved = contentState.getEntity(key);
  expect(retrieved.getType()).toMatchSnapshot();
  expect(retrieved.getMutability()).toMatchSnapshot();
  expect(retrieved.getData()).toMatchSnapshot();
});

test('must throw when retrieving for an invalid key', () => {
  const {contentState} = createLink(ContentState.createFromText(''));
  expect(() => contentState.getEntity('asdfzxcvqweriuop')).toThrow();
});

test('must merge data', () => {
  const result = createLink(ContentState.createFromText(''));
  const key = result.key;
  let contentState = result.contentState;

  // Merge new property.
  const newData = {foo: 'bar'};
  contentState = contentState.mergeEntityData(key, newData);
  const newEntity = contentState.getEntity(key);

  // Replace existing property.
  const withNewURI = {uri: 'homestarrunner.com'};
  contentState = contentState.mergeEntityData(key, withNewURI);
  const entityWithNewURI = contentState.getEntity(key);

  expect(newEntity.getData()).toMatchSnapshot();
  expect(entityWithNewURI.getData()).toMatchSnapshot();
});
