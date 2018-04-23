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

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentState = require('ContentState');
const ContentBlock = require('ContentBlock');
const SelectionState = require('SelectionState');
const DraftModifier = require('DraftModifier');
const Immutable = require('immutable');

const {moveText} = DraftModifier;

const testBlocks = [
  new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'foo bar baz foo',
    characterList: Immutable.List(
      Immutable.Repeat(CharacterMetadata.EMPTY, 15),
    ),
  }),
];

const selectionState = new SelectionState({
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
  hasFocus: true,
});

const blockMap = BlockMapBuilder.createFromArray(testBlocks);
const contentState = new ContentState({
  blockMap,
  entityMap: Immutable.OrderedMap(),
  selectionBefore: selectionState,
  selectionAfter: selectionState,
});

test('moveText moves a portion of a line selected forward to the back of the same block', () => {
  const removalRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 4,
    focusKey: 'a',
    focusOffset: 8,
    hasFocus: true,
    isBackward: false,
  });
  const targetRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 11,
    focusKey: 'a',
    focusOffset: 11,
    hasFocus: true,
    isBackward: false,
  });
  const newContentState = moveText(contentState, removalRange, targetRange);

  expect(newContentState.getFirstBlock().toJS()).toMatchSnapshot();
});

test('moveText moves a portion of a line selected backward to the back of the same block', () => {
  const removalRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 8,
    focusKey: 'a',
    focusOffset: 4,
    hasFocus: true,
    isBackward: true,
  });
  const targetRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 11,
    focusKey: 'a',
    focusOffset: 11,
    hasFocus: true,
    isBackward: false,
  });
  const newContentState = moveText(contentState, removalRange, targetRange);

  expect(newContentState.getFirstBlock().toJS()).toMatchSnapshot();
});

test('moveText ends with a selection at the target when moving text back', () => {
  const removalRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 4,
    focusKey: 'a',
    focusOffset: 8,
    hasFocus: true,
    isBackward: false,
  });
  const targetRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 11,
    focusKey: 'a',
    focusOffset: 11,
    hasFocus: true,
    isBackward: false,
  });
  const newContentState = moveText(contentState, removalRange, targetRange);

  expect(newContentState.getSelectionAfter().toJS()).toMatchSnapshot();
});

test('moveText moves a portion of a line to the front of the same block', () => {
  const removalRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 8,
    focusKey: 'a',
    focusOffset: 11,
    hasFocus: true,
    isBackward: false,
  });
  const targetRange = new SelectionState({
    anchorKey: 'a',
    anchorOffset: 4,
    focusKey: 'a',
    focusOffset: 4,
    hasFocus: true,
    isBackward: false,
  });
  const newContentState = moveText(contentState, removalRange, targetRange);

  expect(newContentState.getFirstBlock().toJS()).toMatchSnapshot();
});
