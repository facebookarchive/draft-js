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

'use strict';

const ContentBlock = require('ContentBlock');

const applyEntityToContentBlock = require('applyEntityToContentBlock');

const sampleBlock = new ContentBlock({
  key: 'a',
  text: 'Hello',
});

const assertApplyEntityToContentBlock = (
  start: number,
  end: number,
  entityKey: $TEMPORARY$string<'x'> = 'x',
  contentBlock: ContentBlock = sampleBlock,
) => {
  expect(
    applyEntityToContentBlock(contentBlock, start, end, entityKey).toJS(),
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
