/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
var Immutable = require('immutable');
var {
  NONE,
  BOLD,
} = require('SampleDraftInlineStyle');

describe('ContentBlock', () => {
  var ENTITY_KEY = 'x';

  function getSampleBlock() {
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
  }

  describe('basic retrieval', () => {
    it('must provide default values', () => {
      var block = new ContentBlock();
      expect(block.getType()).toBe('unstyled');
      expect(block.getText()).toBe('');
      expect(
        Immutable.is(block.getCharacterList(), Immutable.List()),
      ).toBe(true);
    });

    it('must retrieve properties', () => {
      var block = getSampleBlock();
      expect(block.getKey()).toBe('a');
      expect(block.getText()).toBe('Alpha');
      expect(block.getType()).toBe('unstyled');
      expect(block.getLength()).toBe(5);
      expect(block.getCharacterList().count()).toBe(5);
    });
  });

  describe('style retrieval', () => {
    it('must properly retrieve style at offset', () => {
      var block = getSampleBlock();
      expect(block.getInlineStyleAt(0)).toBe(BOLD);
      expect(block.getInlineStyleAt(1)).toBe(NONE);
      expect(block.getInlineStyleAt(2)).toBe(NONE);
      expect(block.getInlineStyleAt(3)).toBe(BOLD);
      expect(block.getInlineStyleAt(4)).toBe(NONE);
    });

    it('must correctly identify ranges of styles', () => {
      var block = getSampleBlock();
      var cb = jest.fn();
      block.findStyleRanges(() => true, cb);

      var calls = cb.mock.calls;
      expect(calls.length).toBe(4);
      expect(calls[0]).toEqual([0, 1]);
      expect(calls[1]).toEqual([1, 3]);
      expect(calls[2]).toEqual([3, 4]);
      expect(calls[3]).toEqual([4, 5]);
    });
  });

  describe('entity retrieval', () => {
    it('must properly retrieve entity at offset', () => {
      var block = getSampleBlock();
      expect(block.getEntityAt(0)).toBe(ENTITY_KEY);
      expect(block.getEntityAt(1)).toBe(null);
      expect(block.getEntityAt(2)).toBe(null);
      expect(block.getEntityAt(3)).toBe(null);
      expect(block.getEntityAt(4)).toBe(ENTITY_KEY);
    });

    it('must correctly identify ranges of entities', () => {
      var block = getSampleBlock();
      var cb = jest.fn();
      block.findEntityRanges(() => true, cb);

      var calls = cb.mock.calls;
      expect(calls.length).toBe(3);
      expect(calls[0]).toEqual([0, 1]);
      expect(calls[1]).toEqual([1, 4]);
      expect(calls[2]).toEqual([4, 5]);
    });
  });
});
