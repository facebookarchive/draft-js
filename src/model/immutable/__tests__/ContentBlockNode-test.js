/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 * @flow strict-local
 */

'use strict';

jest.disableAutomock();

const CharacterMetadata = require('CharacterMetadata');
const ContentBlockNode = require('ContentBlockNode');
const {BOLD, NONE} = require('SampleDraftInlineStyle');

const Immutable = require('immutable');

const entity_KEY = 'x';

const DEFAUL_BLOCK_CONFIG = {
  key: 'a',
  type: 'unstyled',
  text: 'Alpha',
  characterList: Immutable.List.of(
    CharacterMetadata.create({style: BOLD, entity: entity_KEY}),
    CharacterMetadata.EMPTY,
    CharacterMetadata.EMPTY,
    CharacterMetadata.create({style: BOLD}),
    CharacterMetadata.create({entity: entity_KEY}),
  ),
};

const getSampleBlock = props => {
  return new ContentBlockNode({
    ...DEFAUL_BLOCK_CONFIG,
    ...props,
  });
};

test('must have appropriate default values', () => {
  const text = 'Alpha';
  const block = new ContentBlockNode({
    key: 'a',
    type: 'unstyled',
    text,
  });

  const characterList = Immutable.List(
    Immutable.Repeat(CharacterMetadata.EMPTY, text.length),
  );

  expect(block.getKey()).toBe('a');
  expect(block.getText()).toBe('Alpha');
  expect(block.getType()).toBe('unstyled');
  expect(block.getLength()).toBe(5);
  expect(block.getCharacterList().count()).toBe(5);
  expect(block.getCharacterList()).toEqual(characterList);
});

test('must provide default values', () => {
  const block = new ContentBlockNode();
  expect(block.getType()).toBe('unstyled');
  expect(block.getText()).toBe('');
  expect(Immutable.is(block.getCharacterList(), Immutable.List())).toBe(true);
});

test('must retrieve properties', () => {
  const block = getSampleBlock();
  expect(block.getKey()).toBe('a');
  expect(block.getText()).toBe('Alpha');
  expect(block.getType()).toBe('unstyled');
  expect(block.getLength()).toBe(5);
  expect(block.getCharacterList().count()).toBe(5);
});

test('must properly retrieve style at offset', () => {
  const block = getSampleBlock();
  expect(block.getInlineStyleAt(0)).toBe(BOLD);
  expect(block.getInlineStyleAt(1)).toBe(NONE);
  expect(block.getInlineStyleAt(2)).toBe(NONE);
  expect(block.getInlineStyleAt(3)).toBe(BOLD);
  expect(block.getInlineStyleAt(4)).toBe(NONE);
});

test('must correctly identify ranges of styles', () => {
  const block = getSampleBlock();
  const cb = jest.fn();
  block.findStyleRanges(() => true, cb);

  const calls = cb.mock.calls;
  expect(calls.length).toBe(4);
  expect(calls[0]).toEqual([0, 1]);
  expect(calls[1]).toEqual([1, 3]);
  expect(calls[2]).toEqual([3, 4]);
  expect(calls[3]).toEqual([4, 5]);
});

test('must properly retrieve entity at offset', () => {
  const block = getSampleBlock();
  expect(block.getEntityAt(0)).toBe(entity_KEY);
  expect(block.getEntityAt(1)).toBe(null);
  expect(block.getEntityAt(2)).toBe(null);
  expect(block.getEntityAt(3)).toBe(null);
  expect(block.getEntityAt(4)).toBe(entity_KEY);
});

test('must correctly identify ranges of entities', () => {
  const block = getSampleBlock();
  const cb = jest.fn();
  block.findEntityRanges(() => true, cb);

  const calls = cb.mock.calls;
  expect(calls.length).toBe(3);
  expect(calls[0]).toEqual([0, 1]);
  expect(calls[1]).toEqual([1, 4]);
  expect(calls[2]).toEqual([4, 5]);
});

test('must retrieve null when has no parent', () => {
  const block = getSampleBlock();
  expect(block.getParentKey()).toBe(null);
});

test('must retrieve empty List when has no children', () => {
  const block = getSampleBlock();
  expect(block.getChildKeys()).toEqual(Immutable.List());
});

test('must retrieve null when has no next sibbling', () => {
  const block = getSampleBlock();
  expect(block.getNextSiblingKey()).toBe(null);
});

test('must retrieve null when has no previous sibbling', () => {
  const block = getSampleBlock();
  expect(block.getPrevSiblingKey()).toBe(null);
});
