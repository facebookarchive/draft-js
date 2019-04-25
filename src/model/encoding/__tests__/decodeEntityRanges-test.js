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

const decodeEntityRanges = require('decodeEntityRanges');

test('must decode when no entities present', () => {
  const decoded = decodeEntityRanges(' '.repeat(20), []);
  expect(decoded).toMatchSnapshot();
});

test('must decode when an entity is present', () => {
  const decoded = decodeEntityRanges(' '.repeat(5), [
    {
      offset: 2,
      length: 2,
      key: '6',
    },
  ]);
  expect(decoded).toMatchSnapshot();
});

test('must decode when multiple entities present', () => {
  const decoded = decodeEntityRanges(' '.repeat(8), [
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
  const decoded = decodeEntityRanges(' '.repeat(8), [
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

test('must handle ranges that include surrogate pairs', () => {
  const decoded = decodeEntityRanges('Take a \uD83D\uDCF7 #selfie', [
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
