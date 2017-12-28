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

const decodeInlineStyleRanges = require('decodeInlineStyleRanges');

test('must decode for an unstyled block', () => {
  const block = {text: 'Hello'};
  expect(
    decodeInlineStyleRanges(block.text, block.inlineStyleRanges).map(r =>
      r.toJS(),
    ),
  ).toMatchSnapshot();
});

test('must decode for a flat styled block', () => {
  const block = {
    text: 'Hello',
    inlineStyleRanges: [{style: 'BOLD', offset: 0, length: 5}],
  };
  expect(
    decodeInlineStyleRanges(block.text, block.inlineStyleRanges).map(r =>
      r.toJS(),
    ),
  ).toMatchSnapshot();
});

test('must decode for a mixed-style block', () => {
  const block = {
    text: 'Hello',
    inlineStyleRanges: [
      {style: 'BOLD', offset: 0, length: 3},
      {style: 'ITALIC', offset: 1, length: 3},
      {style: 'UNDERLINE', offset: 0, length: 2},
      {style: 'BOLD', offset: 4, length: 1},
    ],
  };
  expect(
    decodeInlineStyleRanges(block.text, block.inlineStyleRanges).map(r =>
      r.toJS(),
    ),
  ).toMatchSnapshot();
});

test('must decode for strings that contain surrogate pairs in UTF-16', () => {
  const block = {
    text: 'Take a \uD83D\uDCF7 #selfie',
    inlineStyleRanges: [
      {offset: 4, length: 4, style: 'BOLD'},
      {offset: 6, length: 8, style: 'ITALIC'},
    ],
  };

  expect(
    decodeInlineStyleRanges(block.text, block.inlineStyleRanges).map(r =>
      r.toJS(),
    ),
  ).toMatchSnapshot();
});
