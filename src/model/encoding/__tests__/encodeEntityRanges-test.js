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

const ContentBlock = require('ContentBlock');

const createCharacterList = require('createCharacterList');
const encodeEntityRanges = require('encodeEntityRanges');
const Immutable = require('immutable');

const {OrderedSet, Repeat} = Immutable;

const createBlock = (text, entities) => {
  const style = OrderedSet();
  return new ContentBlock({
    key: 'a',
    text,
    type: 'unstyled',
    characterList: createCharacterList(
      Repeat(style, text.length).toArray(),
      entities,
    ),
  });
};

test('must return an empty array if no entities present', () => {
  const block = createBlock(' '.repeat(20), Repeat(null, 20).toArray());
  let encoded = encodeEntityRanges(block, {});
  expect(encoded).toMatchSnapshot();

  encoded = encodeEntityRanges(block, {'0': '0'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with the storage-mapped key', () => {
  const entities = [null, null, '6', '6', null];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with multiple entities present', () => {
  const entities = [null, null, '6', '6', null, '8', '8', null];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with an entity present more than once', () => {
  const entities = [null, null, '6', '6', null, '6', '6', null];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

test('must handle ranges that include surrogate pairs', () => {
  const str = 'Take a \uD83D\uDCF7 #selfie';
  // prettier-ignore
  const entities = [
      null, null, null, null, null, null, // `Take a`
      '6', '6', '6', '6', '6', '6',       // ` [camera] #s`
      null, null, '8', '8', null,         // `elfie`
    ];

  const block = createBlock(str, entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});
