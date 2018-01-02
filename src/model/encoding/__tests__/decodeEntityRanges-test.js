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

var decodeEntityRanges = require('decodeEntityRanges');
var {OrderedSet} = require('immutable');

var NONE = OrderedSet();
var SIX = OrderedSet.of('6');
var EIGHT = OrderedSet.of('8');

test('must decode when no entities present', () => {
  var decoded = decodeEntityRanges(' '.repeat(20), []);
  expect(decoded).toMatchSnapshot();
});

test('must decode when an entity is present', () => {
  var decoded = decodeEntityRanges(' '.repeat(5), [
    {
      offset: 2,
      length: 2,
      key: '6',
    },
  ]);
  expect(decoded).toMatchSnapshot();
});

test('must decode when multiple entities present', () => {
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
  expect(decoded).toMatchSnapshot();
});

test('must decode when an entity is present more than once', () => {
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
  expect(decoded).toMatchSnapshot();
});

test('must return overlapping ranges with multiple entities present', () => {
  var decoded = decodeEntityRanges(' '.repeat(8), [
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
  expect(decoded).toMatchSnapshot();
});

it('must return interior ranges with multiple entities present', () => {
  var decoded = decodeEntityRanges(' '.repeat(8), [
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
  expect(decoded).toMatchSnapshot();
});

test('must handle ranges that include surrogate pairs', () => {
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
  expect(decoded).toMatchSnapshot();
});
