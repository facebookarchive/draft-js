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

var decodeEntityRanges = require('decodeEntityRanges');
var {OrderedSet} = require('immutable');

var NONE = OrderedSet();
var SIX = OrderedSet.of('6');
var EIGHT = OrderedSet.of('8');

describe('decodeEntityRanges', () => {
  it('must decode when no entities present', () => {
    var decoded = decodeEntityRanges(' '.repeat(20), []);
    expect(decoded).toEqual(Array(20).fill(NONE));
  });

  it('must decode when an entity is present', () => {
    var decoded = decodeEntityRanges(' '.repeat(5), [
      {
        offset: 2,
        length: 2,
        key: '6',
      },
    ]);
    expect(decoded).toEqual([NONE, NONE, SIX, SIX, NONE]);
  });

  it('must decode when multiple entities present', () => {
    var decoded = decodeEntityRanges(' '.repeat(8), [
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
    expect(decoded).toEqual([NONE, NONE, SIX, SIX, NONE, EIGHT, EIGHT, NONE]);
  });

  it('must decode when an entity is present more than once', () => {
    var decoded = decodeEntityRanges(' '.repeat(8), [
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
    expect(decoded).toEqual([NONE, NONE, SIX, SIX, NONE, SIX, SIX, NONE]);
  });

  it('must handle ranges that include surrogate pairs', () => {
    var decoded = decodeEntityRanges('Take a \uD83D\uDCF7 #selfie', [
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

    expect(decoded).toEqual(entities);
  });
});
