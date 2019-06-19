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

const {stringify, unstringify} = require('DraftStringKey');

test('must convert maybe strings to a string key', () => {
  expect(stringify('anything')).toEqual('_anything');
  expect(stringify(null)).toEqual('_null');
});

test('must convert string keys back to a string', () => {
  expect(unstringify('_anything')).toEqual('anything');
  // This is a lossy conversion
  expect(unstringify('_null')).toEqual('null');
});
