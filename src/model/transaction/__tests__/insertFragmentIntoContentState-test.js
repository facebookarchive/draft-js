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

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const SelectionState = require('SelectionState');

const getSampleStateForTesting = require('getSampleStateForTesting');
const Immutable = require('immutable');
const insertFragmentIntoContentState = require('insertFragmentIntoContentState');
const invariant = require('invariant');

const {contentState, selectionState} = getSampleStateForTesting();
const {List, Map} = Immutable;

const DEFAULT_BLOCK_CONFIG = {
  key: 'j',
  type: 'unstyled',
  text: 'xx',
  data: Map({a: 1}),
};

const initialBlock = contentState.getBlockMap().first();

const getInvariantViolation = msg => {
  try {
    /* eslint-disable fb-www/sprintf-like-args */
    invariant(false, msg);
    /* eslint-enable fb-www/sprintf-like-args */
  } catch (e) {
    return e;
  }
};

const createFragment = (fragment = {}, experimentalTreeDataSupport = false) => {
  const ContentBlockNodeRecord = experimentalTreeDataSupport
    ? ContentBlockNode
    : ContentBlock;
  const newFragment = Array.isArray(fragment) ? fragment : [fragment];

  return BlockMapBuilder.createFromArray(
    newFragment.map(
      config =>
        new ContentBlockNodeRecord({
          ...DEFAULT_BLOCK_CONFIG,
          ...config,
        }),
    ),
  );
};

const createContentBlockNodeFragment = fragment => {
  return createFragment(fragment, true);
};

const assertInsertFragmentIntoContentState = (
  fragment,
  selection = selectionState,
  content = contentState,
) => {
  expect(
    insertFragmentIntoContentState(content, selection, fragment)
      .getBlockMap()
      .toIndexedSeq()
      .toJS(),
  ).toMatchSnapshot();
};

test('must throw if no fragment is provided', () => {
  const fragment = BlockMapBuilder.createFromArray([]);
  expect(() => {
    insertFragmentIntoContentState(contentState, selectionState, fragment);
  }).toThrow();
});

test('must apply fragment to the start', () => {
  assertInsertFragmentIntoContentState(createFragment());
});

test('must apply fragment to within block', () => {
  assertInsertFragmentIntoContentState(
    createFragment(),
    selectionState.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    }),
  );
});

test('must apply fragment at the end', () => {
  assertInsertFragmentIntoContentState(
    createFragment(),
    selectionState.merge({
      focusOffset: initialBlock.getLength(),
      anchorOffset: initialBlock.getLength(),
      isBackward: false,
    }),
  );
});

test('must apply multiblock fragments', () => {
  assertInsertFragmentIntoContentState(
    createFragment([
      DEFAULT_BLOCK_CONFIG,
      {
        key: 'k',
        text: 'yy',
        data: Map({b: 2}),
      },
    ]),
  );
});

test('must be able to insert a fragment with a single ContentBlockNode', () => {
  const initialSelection = SelectionState.createEmpty('A');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'A',
        text: '',
      },
    ]),
  );

  assertInsertFragmentIntoContentState(
    createContentBlockNodeFragment([
      {
        key: 'B',
        text: 'some text',
      },
    ]),
    initialSelection,
    initialContent,
  );
});

test('must be able to insert fragment of ContentBlockNodes', () => {
  const initialSelection = SelectionState.createEmpty('first');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'first',
        text: '',
        nextSibling: 'second',
      },
      {
        key: 'second',
        text: '',
        prevSibling: 'first',
      },
    ]),
  );

  assertInsertFragmentIntoContentState(
    createContentBlockNodeFragment([
      {
        key: 'B',
        text: '',
        children: List(['C']),
        nextSibling: 'E',
      },
      {
        key: 'C',
        parent: 'B',
        text: '',
        children: List(['D']),
      },
      {
        key: 'D',
        parent: 'C',
        text: 'Delta',
      },
      {
        key: 'E',
        text: 'Elephant',
        prevSibling: 'B',
      },
    ]),
    initialSelection,
    initialContent,
  );
});

test('must be able to insert fragment of ContentBlockNodes after nested block', () => {
  const initialSelection = SelectionState.createEmpty('firstChild');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'root',
        text: '',
        children: List(['firstChild', 'lastChild']),
      },
      {
        key: 'firstChild',
        parent: 'root',
        text: '',
        nextSibling: 'lastChild',
      },
      {
        key: 'lastChild',
        parent: 'root',
        text: '',
        prevSibling: 'firstChild',
      },
    ]),
  );

  assertInsertFragmentIntoContentState(
    createContentBlockNodeFragment([
      {
        key: 'B',
        text: '',
        children: List(['C']),
        nextSibling: 'E',
      },
      {
        key: 'C',
        parent: 'B',
        text: '',
        children: List(['D']),
      },
      {
        key: 'D',
        parent: 'C',
        text: 'Delta',
      },
      {
        key: 'E',
        text: 'Elephant',
        prevSibling: 'B',
      },
    ]),
    initialSelection,
    initialContent,
  );
});

test('must be able to insert a fragment of ContentBlockNodes while updating the target block with the first fragment block properties', () => {
  const initialSelection = SelectionState.createEmpty('first');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'first',
        text: '',
        nextSibling: 'second',
      },
      {
        key: 'second',
        text: '',
        prevSibling: 'first',
      },
    ]),
  );

  assertInsertFragmentIntoContentState(
    createContentBlockNodeFragment([
      {
        key: 'A',
        text: 'Alpha',
        nextSibling: 'B',
      },
      {
        key: 'B',
        text: '',
        children: List(['C']),
        prevSibling: 'A',
      },
      {
        key: 'C',
        parent: 'B',
        text: '',
        children: List(['D']),
      },
      {
        key: 'D',
        parent: 'C',
        text: 'Delta',
      },
    ]),
    initialSelection,
    initialContent,
  );
});

test('must be able to insert a fragment of ContentBlockNodes while updating the target block with the first fragment block properties after nested block', () => {
  const initialSelection = SelectionState.createEmpty('firstChild');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'root',
        text: '',
        children: List(['firstChild', 'lastChild']),
      },
      {
        key: 'firstChild',
        parent: 'root',
        text: '',
        nextSibling: 'lastChild',
      },
      {
        key: 'lastChild',
        parent: 'root',
        text: '',
        prevSibling: 'firstChild',
      },
    ]),
  );

  assertInsertFragmentIntoContentState(
    createContentBlockNodeFragment([
      {
        key: 'A',
        text: 'Alpha',
        nextSibling: 'B',
      },
      {
        key: 'B',
        text: '',
        children: List(['C']),
        prevSibling: 'A',
        nextSibling: 'E',
      },
      {
        key: 'C',
        parent: 'B',
        text: '',
        children: List(['D']),
      },
      {
        key: 'D',
        parent: 'C',
        text: 'Delta',
      },
      {
        key: 'E',
        text: 'Elephant',
        prevSibling: 'B',
      },
    ]),
    initialSelection,
    initialContent,
  );
});

test('must throw an error when trying to apply ContentBlockNode fragments when selection is on a block that has children', () => {
  const initialSelection = SelectionState.createEmpty('A');
  const initialContent = contentState.set(
    'blockMap',
    createContentBlockNodeFragment([
      {
        key: 'A',
        text: '',
        children: List(['B']),
      },
      {
        key: 'B',
        text: 'child',
        parent: 'A',
      },
    ]),
  );

  expect(() =>
    insertFragmentIntoContentState(
      initialContent,
      initialSelection,
      createContentBlockNodeFragment([
        {
          key: 'C',
          text: 'some text',
        },
      ]),
    ),
  ).toThrow(
    getInvariantViolation(
      '`insertFragment` should not be called when a container node is selected.',
    ),
  );
});
