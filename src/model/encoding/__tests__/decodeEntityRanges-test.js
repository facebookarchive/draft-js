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

describe('decodeEntityRanges', () => {
  it('must decode when no entities present', () => {
    var decoded = decodeEntityRanges(' '.repeat(20), []);
    expect(decoded).toEqual(Array(20).fill(null));
  });

  it('must decode when an entity is present', () => {
    var decoded = decodeEntityRanges(
      ' '.repeat(5),
      [{
        offset: 2,
        length: 2,
        key: '6',
      }],
    );
    expect(decoded).toEqual([null, null, '6', '6', null]);
  });

  it('must decode when multiple entities present', () => {
    var decoded = decodeEntityRanges(
      ' '.repeat(8),
      [
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
      ]
    );
    expect(decoded).toEqual([null, null, '6', '6', null, '8', '8', null]);
  });

  it('must decode when an entity is present more than once', () => {
    var decoded = decodeEntityRanges(
      ' '.repeat(8),
      [
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
      ]
    );
    expect(decoded).toEqual([null, null, '6', '6', null, '6', '6', null]);
  });

  it('must handle ranges that include surrogate pairs', () => {
    var decoded = decodeEntityRanges(
      'Take a \uD83D\uDCF7 #selfie',
      [
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
      ]
    );

    var entities = [
      null, null, null, null, null, null, // `Take a`
      '6', '6', '6', '6', '6', '6',       // ` [camera] #s`
      null, null, '8', '8', null,         // `elfie`
    ];

    expect(decoded).toEqual(entities);
  });
});
