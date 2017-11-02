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

jest.disableAutomock();

const sanitizeDraftText = require('sanitizeDraftText');

test('must strip trailing carriage returns', () => {
  expect(sanitizeDraftText('test\u000d')).toMatchSnapshot();
});

test('must strip two trailing carriage returns', () => {
  expect(sanitizeDraftText('test\u000d\u000d')).toMatchSnapshot();
});

test('must strip within carriage returns', () => {
  expect(sanitizeDraftText('te\u000dst')).toMatchSnapshot();
});

test('must strip leading carriage returns', () => {
  expect(sanitizeDraftText('\u000dtest')).toMatchSnapshot();
});

test('must strip all carriage returns', () => {
  expect(
    sanitizeDraftText('\u000dt\u000des\u000dt\u000d\u000d'),
  ).toMatchSnapshot();
});
