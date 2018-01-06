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

jest.mock('generateRandomKey');

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const Immutable = require('immutable');

const getSampleStateForTesting = require('getSampleStateForTesting');
const insertFragmentIntoContentState = require('insertFragmentIntoContentState');

const {contentState, selectionState} = getSampleStateForTesting();
const {EMPTY} = CharacterMetadata;
const {List, Map} = Immutable;

const DEFAULT_BLOCK_CONFIG = {
  key: 'j',
  type: 'unstyled',
  text: 'xx',
  characterList: List.of(EMPTY, EMPTY),
  data: new Map({a: 1}),
};

const initialBlock = contentState.getBlockMap().first();

const createFragment = (fragment = {}) => {
  fragment = Array.isArray(fragment) ? fragment : [fragment];

  return BlockMapBuilder.createFromArray(
    fragment.map(
      config =>
        new ContentBlock({
          ...DEFAULT_BLOCK_CONFIG,
          ...config,
        }),
    ),
  );
};

const assertInsertFragmentIntoContentState = (
  fragment,
  selection = selectionState,
  content = contentState,
) => {
  expect(
    insertFragmentIntoContentState(content, selection, fragment).toJS(),
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
        data: new Map({b: 2}),
      },
    ]),
  );
});
