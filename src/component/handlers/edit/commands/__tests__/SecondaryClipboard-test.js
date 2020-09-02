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

jest.mock('generateRandomKey');

const toggleExperimentalTreeDataSupport = enabled => {
  jest.doMock('gkx', () => name => {
    return name === 'draft_tree_data_support' ? enabled : false;
  });
};

// Seems to be important to put this at the top
toggleExperimentalTreeDataSupport(true);

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const EditorState = require('EditorState');
const SecondaryClipboard = require('SecondaryClipboard');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');

const {List} = Immutable;

const {contentState} = getSampleStateForTesting();

const contentBlockNodes = [
  new ContentBlockNode({
    key: 'A',
    nextSibling: 'B',
    text: 'Alpha',
    type: 'blockquote',
  }),
  new ContentBlockNode({
    key: 'B',
    prevSibling: 'A',
    nextSibling: 'G',
    type: 'ordered-list-item',
    children: List(['C', 'F']),
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'C',
    nextSibling: 'F',
    type: 'blockquote',
    children: List(['D', 'E']),
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'D',
    nextSibling: 'E',
    type: 'header-two',
    text: 'Delta',
  }),
  new ContentBlockNode({
    parent: 'C',
    key: 'E',
    prevSibling: 'D',
    type: 'unstyled',
    text: 'Elephant',
  }),
  new ContentBlockNode({
    parent: 'B',
    key: 'F',
    prevSibling: 'C',
    type: 'code-block',
    text: 'Fire',
  }),
  new ContentBlockNode({
    key: 'G',
    prevSibling: 'B',
    nextSibling: 'H',
    type: 'ordered-list-item',
    text: 'Gorila',
  }),
  new ContentBlockNode({
    key: 'H',
    prevSibling: 'G',
    nextSibling: 'I',
    text: ' ',
    type: 'atomic',
  }),
  new ContentBlockNode({
    key: 'I',
    prevSibling: 'H',
    text: 'last',
    type: 'unstyled',
  }),
];

const assertCutOperation = (
  operation,
  selection = {},
  content = contentBlockNodes,
) => {
  const result = operation(
    EditorState.forceSelection(
      EditorState.createWithContent(
        contentState.set('blockMap', BlockMapBuilder.createFromArray(content)),
      ),
      SelectionState.createEmpty(content[0].key).merge(selection),
    ),
  );
  const expected = result
    .getCurrentContent()
    .getBlockMap()
    .toJS();

  expect(expected).toMatchSnapshot();
};

test(`in the middle of a block, cut removes the remainder of the block`, () => {
  assertCutOperation(editorState => SecondaryClipboard.cut(editorState), {
    anchorKey: 'E',
    anchorOffset: contentBlockNodes[4].getLength() - 2,
    focusKey: 'E',
    focusOffset: contentBlockNodes[4].getLength() - 2,
  });
});

test(`at the end of an intermediate block, cut merges with the adjacent content block`, () => {
  assertCutOperation(editorState => SecondaryClipboard.cut(editorState), {
    anchorKey: 'H',
    anchorOffset: contentBlockNodes[7].getLength(),
    focusKey: 'H',
    focusOffset: contentBlockNodes[7].getLength(),
  });
});

test(`at the end of the last block, cut is a no-op`, () => {
  assertCutOperation(editorState => SecondaryClipboard.cut(editorState), {
    anchorKey: 'I',
    anchorOffset: contentBlockNodes[8].getLength(),
    focusKey: 'I',
    focusOffset: contentBlockNodes[8].getLength(),
  });
});
