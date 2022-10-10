/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

const DraftOffsetKey = require('DraftOffsetKey');

test('decodes offset key with no delimiter', () => {
  expect(DraftOffsetKey.decode('key-0-1')).toMatchSnapshot();
});

test('decodes offset key with delimiter in between', () => {
  expect(DraftOffsetKey.decode('key-with-delimiter-0-1')).toMatchSnapshot();
});

test('decodes offset key with delimiter at the beginning', () => {
  expect(DraftOffsetKey.decode('-key-0-1')).toMatchSnapshot();
});

test('decodes offset key with delimiter at the end', () => {
  expect(DraftOffsetKey.decode('key--0-1')).toMatchSnapshot();
});
