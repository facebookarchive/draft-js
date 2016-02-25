/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleStateForTesting
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const Immutable = require('immutable');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');

const {BOLD, ITALIC} = SampleDraftInlineStyle;
const ENTITY_KEY = '123';

const BLOCKS = [
  new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'Alpha',
    characterList: Immutable.List(
      Immutable.Repeat(CharacterMetadata.EMPTY, 5)
    ),
  }),
  new ContentBlock({
    key: 'b',
    type: 'unordered-list-item',
    text: 'Bravo',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({style: BOLD, entity: ENTITY_KEY}),
        5
      )
    ),
  }),
  new ContentBlock({
    key: 'c',
    type: 'blockquote',
    text: 'Charlie',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({style: ITALIC, entity: null}),
        7
      )
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

const blockMap = BlockMapBuilder.createFromArray(BLOCKS);
const contentState = new ContentState({
  blockMap,
  selectionBefore: selectionState,
  selectionAfter: selectionState,
});

function getSampleStateForTesting(): Object {
  return {contentState, selectionState};
}

module.exports = getSampleStateForTesting;
