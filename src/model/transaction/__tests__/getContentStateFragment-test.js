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

jest.mock('generateRandomKey');

const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const getContentStateFragment = require('getContentStateFragment');
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
  new ContentBlock({
    key: 'D',
    text: 'Delta',
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
    text: 'Delta',
    prevSibling: 'B',
  }),
];

const DEFAULT_SELECTION = {
  anchorKey: 'A',
  anchorOffset: 0,
  focusKey: 'D',
  focusOffset: 0,
  isBackward: false,
};

const assertGetContentStateFragment = (blocksArray, selection = {}) => {
  const editor = EditorState.acceptSelection(
    EditorState.createWithContent(
      ContentState.createFromBlockArray([...blocksArray]),
    ),
    new SelectionState({
      ...DEFAULT_SELECTION,
      ...selection,
    }),
  );

  expect(
    getContentStateFragment(
      editor.getCurrentContent(),
      editor.getSelection(),
    ).toJS(),
  ).toMatchSnapshot();
};

test('must be able to return all selected contentBlocks', () => {
  assertGetContentStateFragment(contentBlocks, {
    focusOffset: contentBlocks[3].getLength(),
  });
});

test('must be able to return all selected contentBlockNodes', () => {
  assertGetContentStateFragment(contentBlockNodes, {
    focusOffset: contentBlockNodes[3].getLength(),
  });
});

test('must be able to return contentBlocks selected within', () => {
  assertGetContentStateFragment(contentBlocks, {
    anchorKey: 'B',
    focusKey: 'C',
    focusOffset: contentBlockNodes[2].getLength(),
  });
});

test('must be able to return contentBlockNodes selected within', () => {
  assertGetContentStateFragment(contentBlockNodes, {
    anchorKey: 'B',
    focusKey: 'C',
    focusOffset: contentBlockNodes[2].getLength(),
  });
});

test('must be able to return first ContentBlock selected', () => {
  assertGetContentStateFragment(contentBlocks, {
    anchorKey: 'A',
    focusKey: 'A',
    focusOffset: contentBlocks[0].getLength(),
  });
});

test('must be able to return first ContentBlockNode selected', () => {
  assertGetContentStateFragment(contentBlockNodes, {
    anchorKey: 'A',
    focusKey: 'A',
    focusOffset: contentBlockNodes[0].getLength(),
  });
});

test('must be able to return last ContentBlock selected', () => {
  assertGetContentStateFragment(contentBlocks, {
    anchorKey: 'D',
    focusKey: 'D',
    focusOffset: contentBlocks[3].getLength(),
  });
});

test('must be able to return last ContentBlockNode selected', () => {
  assertGetContentStateFragment(contentBlockNodes, {
    anchorKey: 'D',
    focusKey: 'D',
    focusOffset: contentBlockNodes[3].getLength(),
  });
});
