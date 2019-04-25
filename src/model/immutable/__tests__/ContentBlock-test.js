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

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const {BOLD} = require('SampleDraftInlineStyle');

const Immutable = require('immutable');

const ENTITY_KEY = 'x';

const getSampleBlock = () => {
  return new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'Alpha',
    characterList: Immutable.List.of(
      CharacterMetadata.create({style: BOLD, entity: ENTITY_KEY}),
      CharacterMetadata.EMPTY,
      CharacterMetadata.EMPTY,
      CharacterMetadata.create({style: BOLD}),
      CharacterMetadata.create({entity: ENTITY_KEY}),
    ),
  });
};

test('must have appropriate default values', () => {
  const text = 'Alpha';
  const block = new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text,
  });

  expect(block.getKey()).toMatchSnapshot();
  expect(block.getText()).toMatchSnapshot();
  expect(block.getType()).toMatchSnapshot();
  expect(block.getLength()).toMatchSnapshot();
  expect(block.getCharacterList().count()).toMatchSnapshot();
  expect(block.getCharacterList().toJS()).toMatchSnapshot();
});

test('must provide default values', () => {
  const block = new ContentBlock({});
  expect(block.getType()).toMatchSnapshot();
  expect(block.getText()).toMatchSnapshot();
  expect(
    Immutable.is(block.getCharacterList(), Immutable.List()),
  ).toMatchSnapshot();
});

test('must retrieve properties', () => {
  const block = getSampleBlock();
  expect(block.getKey()).toMatchSnapshot();
  expect(block.getText()).toMatchSnapshot();
  expect(block.getType()).toMatchSnapshot();
  expect(block.getLength()).toMatchSnapshot();
  expect(block.getCharacterList().count()).toMatchSnapshot();
});

test('must properly retrieve style at offset', () => {
  const block = getSampleBlock();

  for (let i = 0; i <= 4; i++) {
    expect(block.getInlineStyleAt(i).toJS()).toMatchSnapshot();
  }
});

test('must correctly identify ranges of styles', () => {
  const block = getSampleBlock();
  const cb = jest.fn();
  block.findStyleRanges(() => true, cb);

  expect(cb.mock.calls).toMatchSnapshot();
});

test('must properly retrieve entity at offset', () => {
  const block = getSampleBlock();

  for (let i = 0; i <= 4; i++) {
    expect(block.getEntityAt(i)).toMatchSnapshot();
  }
});

test('must correctly identify ranges of entities', () => {
  const block = getSampleBlock();
  const cb = jest.fn();
  block.findEntityRanges(() => true, cb);

  expect(cb.mock.calls).toMatchSnapshot();
});
