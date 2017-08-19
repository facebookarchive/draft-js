/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var ContentBlock = require('ContentBlock');
var Immutable = require('immutable');

var createCharacterList = require('createCharacterList');
var encodeEntityRanges = require('encodeEntityRanges');

var {OrderedSet, Repeat} = Immutable;

var NONE = OrderedSet();
var SIX = OrderedSet.of('6');
var EIGHT = OrderedSet.of('8');

describe('encodeEntityRanges', () => {
  function createBlock(text, entities) {
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
  }

  it('must return an empty array if no entities present', () => {
    var block = createBlock(' '.repeat(20), Repeat(NONE, 20).toArray());
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([]);

    encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([]);
  });

  it('must return ranges with the storage-mapped key', () => {
    var entities = [NONE, NONE, SIX, SIX, NONE];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: '6',
      },
    ]);
  });

  it('must return ranges with multiple entities present', () => {
    var entities = [NONE, NONE, SIX, SIX, NONE, EIGHT, EIGHT, NONE];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: '6',
      },
      {
        offset: 5,
        length: 2,
        key: '8',
      },
    ]);
  });

  it('must return overlapping ranges with multiple entities present', () => {
    var entities = [NONE, NONE, SIX, SIX, SIX.union(EIGHT), EIGHT, EIGHT, NONE];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 3,
        key: '6',
      },
      {
        offset: 4,
        length: 3,
        key: '8',
      },
    ]);
  });

  it('must return interior ranges with multiple entities present', () => {
    var entities = [NONE, NONE, SIX, SIX, SIX.union(EIGHT), SIX, SIX, NONE];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 5,
        key: '6',
      },
      {
        offset: 4,
        length: 1,
        key: '8',
      },
    ]);
  });

  it('must return ranges with an entity present more than once', () => {
    var entities = [NONE, NONE, SIX, SIX, NONE, SIX, SIX, NONE];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: '6',
      },
      {
        offset: 5,
        length: 2,
        key: '6',
      },
    ]);
  });

  it('must handle ranges that include surrogate pairs', () => {
    var str = 'Take a \uD83D\uDCF7 #selfie';
    var entities = [
      NONE,
      NONE,
      NONE,
      NONE,
      NONE,
      NONE, // `Take a`
      SIX,
      SIX,
      SIX,
      SIX,
      SIX,
      SIX, // ` [camera] #s`
      NONE,
      NONE,
      EIGHT,
      EIGHT,
      NONE, // `elfie`
    ];

    var block = createBlock(str, entities);
    var encoded = encodeEntityRanges(block);
    expect(encoded).toEqual([
      {
        offset: 6,
        length: 5,
        key: '6',
      },
      {
        offset: 13,
        length: 2,
        key: '8',
      },
    ]);
  });
});
