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

jest.mock('generateRandomKey');

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const Immutable = require('immutable');

const randomizeBlockMapKeys = require('randomizeBlockMapKeys');

const {List} = Immutable;

const assertRandomizeBlockMapKeys = blockMapArray => {
  expect(
    randomizeBlockMapKeys(
      BlockMapBuilder.createFromArray(blockMapArray),
    ).toJS(),
  ).toMatchSnapshot();
};

beforeEach(() => {
  jest.resetModules();
});

test('must be able to randomize keys for ContentBlocks BlockMap', () => {
  assertRandomizeBlockMapKeys([
    new ContentBlock({
      key: 'A',
      text: 'Alpha',
    }),
    new ContentBlock({
      key: 'B',
      text: 'Beta',
    }),
    new ContentBlock({
      key: 'C',
      text: 'Charlie',
    }),
    new ContentBlock({
      key: 'D',
      text: 'Delta',
    }),
  ]);
});

test('must be able to randomize keys for ContentBlockNodes BlockMap and update reference links to the new keys', () => {
  assertRandomizeBlockMapKeys([
    new ContentBlockNode({
      key: 'A',
      text: '',
      children: List(['B', 'D']),
    }),
    new ContentBlockNode({
      key: 'B',
      parent: 'A',
      children: List(['C']),
      nextSibling: 'D',
      text: '',
    }),
    new ContentBlockNode({
      key: 'C',
      parent: 'B',
      text: 'X',
    }),
    new ContentBlockNode({
      key: 'D',
      parent: 'A',
      prevSibling: 'B',
      text: 'Y',
    }),
  ]);
});
