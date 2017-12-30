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

const ContentBlock = require('ContentBlock');
const Immutable = require('immutable');

const createCharacterList = require('createCharacterList');
const encodeEntityRanges = require('encodeEntityRanges');

const {NONE} = require('DraftEntitySet');

const {OrderedSet, Repeat} = Immutable;

const SIX = OrderedSet.of('6');
const EIGHT = OrderedSet.of('8');

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
  const block = createBlock(' '.repeat(20), Repeat(NONE, 20).toArray());
  let encoded = encodeEntityRanges(block, {});
  expect(encoded).toMatchSnapshot();

  encoded = encodeEntityRanges(block, {'0': '0'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with the storage-mapped key', () => {
  const entities = [NONE, NONE, SIX, SIX, NONE];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with multiple entities present', () => {
  const entities = [NONE, NONE, SIX, SIX, NONE, EIGHT, EIGHT, NONE];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

it('must return overlapping ranges with multiple entities present', () => {
  var entities = [NONE, NONE, SIX, SIX, SIX.union(EIGHT), EIGHT, EIGHT, NONE];
  var block = createBlock(' '.repeat(entities.length), entities);
  var encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

it('must return interior ranges with multiple entities present', () => {
  var entities = [NONE, NONE, SIX, SIX, SIX.union(EIGHT), SIX, SIX, NONE];
  var block = createBlock(' '.repeat(entities.length), entities);
  var encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

test('must return ranges with an entity present more than once', () => {
  const entities = [NONE, NONE, SIX, SIX, NONE, SIX, SIX, NONE];
  const block = createBlock(' '.repeat(entities.length), entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});

test('must handle ranges that include surrogate pairs', () => {
  const str = 'Take a \uD83D\uDCF7 #selfie';
  // prettier-ignore
  const entities = [
      NONE, NONE, NONE, NONE, NONE, NONE, // `Take a`
      SIX, SIX, SIX, SIX, SIX, SIX,       // ` [camera] #s`
      NONE, NONE, EIGHT, EIGHT, NONE,         // `elfie`
    ];

  const block = createBlock(str, entities);
  const encoded = encodeEntityRanges(block, {_6: '0', _8: '1'});
  expect(encoded).toMatchSnapshot();
});
