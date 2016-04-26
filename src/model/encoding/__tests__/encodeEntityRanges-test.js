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
    var block = createBlock(' '.repeat(20), Repeat(null, 20).toArray());
    var encoded = encodeEntityRanges(block, {});
    expect(encoded).toEqual([]);

    encoded = encodeEntityRanges(block, {'0': '0'});
    expect(encoded).toEqual([]);
  });

  it('must return ranges with the storage-mapped key', () => {
    var entities = [null, null, '6', '6', null];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block, {'_6': '0'});
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: 0,
      },
    ]);
  });

  it('must return ranges with multiple entities present', () => {
    var entities = [null, null, '6', '6', null, '8', '8', null];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block, {'_6': '0', '_8': '1'});
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: 0,
      },
      {
        offset: 5,
        length: 2,
        key: 1,
      },
    ]);
  });

  it('must return ranges with an entity present more than once', () => {
    var entities = [null, null, '6', '6', null, '6', '6', null];
    var block = createBlock(' '.repeat(entities.length), entities);
    var encoded = encodeEntityRanges(block, {'_6': '0', '_8': '1'});
    expect(encoded).toEqual([
      {
        offset: 2,
        length: 2,
        key: 0,
      },
      {
        offset: 5,
        length: 2,
        key: 0,
      },
    ]);
  });

  it('must handle ranges that include surrogate pairs', () => {
    var str = 'Take a \uD83D\uDCF7 #selfie';
    var entities = [
      null, null, null, null, null, null, // `Take a`
      '6', '6', '6', '6', '6', '6',       // ` [camera] #s`
      null, null, '8', '8', null,         // `elfie`
    ];

    var block = createBlock(str, entities);
    var encoded = encodeEntityRanges(block, {'_6': '0', '_8': '1'});
    expect(encoded).toEqual([
      {
        offset: 6,
        length: 5,
        key: 0,
      },
      {
        offset: 13,
        length: 2,
        key: 1,
      },
    ]);
  });
});
