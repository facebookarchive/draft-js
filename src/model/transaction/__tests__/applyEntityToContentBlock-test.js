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

const ContentBlock = require('ContentBlock');

const applyEntityToContentBlock = require('applyEntityToContentBlock');

const sampleBlock = new ContentBlock({
  key: 'a',
  text: 'Hello',
});

const assertApplyEntityToContentBlock = (
  start,
  end,
  entityKey = 'x',
  contentBlock = sampleBlock,
) => {
  expect(
    applyEntityToContentBlock(contentBlock, start, end, entityKey, true).toJS(),
  ).toMatchSnapshot();
};

test('must apply from the start', () => {
  assertApplyEntityToContentBlock(0, 2);
});

test('must apply within', () => {
  assertApplyEntityToContentBlock(1, 4);
});

test('must apply at the end', () => {
  assertApplyEntityToContentBlock(3, 5);
});

test('must apply to the entire text', () => {
  assertApplyEntityToContentBlock(0, 5);
});
