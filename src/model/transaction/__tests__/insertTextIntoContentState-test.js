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

const CharacterMetadata = require('CharacterMetadata');
const {BOLD} = require('SampleDraftInlineStyle');

const getSampleStateForTesting = require('getSampleStateForTesting');
const insertTextIntoContentState = require('insertTextIntoContentState');

const {contentState, selectionState} = getSampleStateForTesting();

const EMPTY = CharacterMetadata.EMPTY;
const initialBlock = contentState.getBlockMap().first();

const assertInsertTextIntoContentState = (
  text,
  characterMetadata,
  selection = selectionState,
) => {
  expect(
    insertTextIntoContentState(contentState, selection, text, characterMetadata)
      .getBlockMap()
      .toJS(),
  ).toMatchSnapshot();
};

test('must throw if selection is not collapsed', () => {
  expect(() => {
    insertTextIntoContentState(
      contentState,
      selectionState.set('focusOffset', 2),
      'hey',
      EMPTY,
    );
  }).toThrow();
});

test('must return early if no text is provided', () => {
  assertInsertTextIntoContentState('', EMPTY);
});

test('must insert at the start', () => {
  assertInsertTextIntoContentState(
    'xx',
    CharacterMetadata.create({style: BOLD}),
  );
});

test('must insert within block', () => {
  assertInsertTextIntoContentState(
    'xx',
    CharacterMetadata.create({style: BOLD}),
    selectionState.merge({
      focusOffset: 2,
      anchorOffset: 2,
      isBackward: false,
    }),
  );
});

test('must insert at the end', () => {
  assertInsertTextIntoContentState(
    'xx',
    CharacterMetadata.create({style: BOLD}),
    selectionState.merge({
      focusOffset: initialBlock.getLength(),
      anchorOffset: initialBlock.getLength(),
      isBackward: false,
    }),
  );
});
