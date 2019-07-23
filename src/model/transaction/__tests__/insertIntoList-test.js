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

const Immutable = require('immutable');
const insertIntoList = require('insertIntoList');

const SAMPLE_LIST = Immutable.List.of(0, 1, 2, 3, 4);

const assertAssertInsertIntoList = (
  toInsert,
  offset = SAMPLE_LIST.size,
  targetList = SAMPLE_LIST,
) => {
  expect(insertIntoList(targetList, toInsert, offset)).toMatchSnapshot();
};

test('must insert at end of list', () => {
  assertAssertInsertIntoList(Immutable.List.of(100, 101, 102));
});

test('must insert at beginning of list', () => {
  assertAssertInsertIntoList(Immutable.List.of(100, 101, 102), 0);
});

test('must insert within a list', () => {
  assertAssertInsertIntoList(Immutable.List.of(100, 101, 102), 3);
});
