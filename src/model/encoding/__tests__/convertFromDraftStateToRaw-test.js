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
 * @flow
 */

'use strict';

jest.disableAutomock();

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const Immutable = require('immutable');

const convertFromDraftStateToRaw = require('convertFromDraftStateToRaw');
const getSampleStateForTesting = require('getSampleStateForTesting');

const {contentState} = getSampleStateForTesting();

const treeContentState = contentState.set(
  'blockMap',
  BlockMapBuilder.createFromArray([
    new ContentBlockNode({
      key: 'A',
      children: Immutable.List.of('B', 'E'),
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'B',
      nextSibling: 'C',
      children: Immutable.List.of('C', 'D'),
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'C',
      text: 'left block',
      nextSibling: 'D',
    }),
    new ContentBlockNode({
      parent: 'B',
      key: 'D',
      text: 'right block',
      prevSibling: 'C',
    }),
    new ContentBlockNode({
      parent: 'A',
      key: 'E',
      text: 'This is a tree based document!',
      type: 'header-one',
      prevSibling: 'B',
    }),
  ]),
);

const assertConvertFromDraftStateToRaw = content => {
  expect(convertFromDraftStateToRaw(content)).toMatchSnapshot();
};

test('must be able to convert from draft state with ContentBlock to raw', () => {
  assertConvertFromDraftStateToRaw(contentState);
});

test('must be able to convert from draft state with ContentBlockNode to raw', () => {
  assertConvertFromDraftStateToRaw(treeContentState);
});
