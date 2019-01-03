/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 * @flow strict-local
 */

'use strict';

jest.disableAutomock();

jest.mock('generateRandomKey');

const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const EditorState = require('EditorState');

const getNextDelimiterBlockKey = require('getNextDelimiterBlockKey');
const Immutable = require('immutable');

const {List} = Immutable;

const contentBlocks = [
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
];

const contentBlockNodes = [
  new ContentBlockNode({
    key: 'A',
    text: 'Alpha',
    nextSibling: 'B',
  }),
  new ContentBlockNode({
    key: 'B',
    text: '',
    children: List(['C']),
    nextSibling: 'D',
    prevSibling: 'A',
  }),
  new ContentBlockNode({
    key: 'C',
    parent: 'B',
    text: 'Charlie',
  }),
  new ContentBlockNode({
    key: 'D',
    text: '',
    prevSibling: 'B',
    children: List(['E', 'F']),
  }),
  new ContentBlockNode({
    key: 'E',
    parent: 'D',
    nextSibling: 'F',
    text: 'Elephant',
  }),
  new ContentBlockNode({
    key: 'F',
    parent: 'D',
    prevSibling: 'E',
    text: 'Fire',
  }),
];

const assertGetNextDelimiterBlockKey = (
  targetBlockKey,
  blocksArray = contentBlockNodes,
) => {
  const editor = EditorState.createWithContent(
    ContentState.createFromBlockArray(blocksArray),
  );
  const contentState = editor.getCurrentContent();
  const targetBlock = contentState.getBlockForKey(targetBlockKey);

  expect(
    getNextDelimiterBlockKey(targetBlock, contentState.getBlockMap()),
  ).toMatchSnapshot();
};

test('must return null when block is ContentBlock', () => {
  assertGetNextDelimiterBlockKey('A', contentBlocks);
});

test('must return null when only blocks after it are its own descendants', () => {
  assertGetNextDelimiterBlockKey('D');
});

test('must return null when block is the last block', () => {
  assertGetNextDelimiterBlockKey('F');
});

test('must find its next sibling when has siblings', () => {
  assertGetNextDelimiterBlockKey('E');
});

test('must find its next delimiter when block does not have siblings', () => {
  assertGetNextDelimiterBlockKey('C');
});
