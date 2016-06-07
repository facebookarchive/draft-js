/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleStateForTestingNestedBlocks
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const Immutable = require('immutable');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');

const {
  BOLD,
  ITALIC
} = SampleDraftInlineStyle;
const ENTITY_KEY = '123';

const BLOCKS = [
  new ContentBlock({
    key: 'a',
    type: 'header-one',
    text: 'Alpha',
    characterList: Immutable.List(
      Immutable.Repeat(CharacterMetadata.EMPTY, 5)
    ),
  }),
  new ContentBlock({
    key: 'b',
    type: 'blockquote',
    text: '',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({
          style: BOLD,
          entity: ENTITY_KEY
        }),
        5
      )
    ),
  }),
  new ContentBlock({
    key: 'b/c',
    type: 'ordered-list-item',
    text: 'Charlie',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({
          style: ITALIC,
          entity: null
        }),
        7
      )
    ),
  }),
  new ContentBlock({
    key: 'b/d',
    type: 'unordered-list-item',
    text: '',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({
          style: ITALIC,
          entity: null
        }),
        7
      )
    ),
  }),
  new ContentBlock({
    key: 'b/d/e',
    type: 'header-one',
    text: 'Echo',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({
          style: ITALIC,
          entity: null
        }),
        7
      )
    ),
  }),
  new ContentBlock({
    key: 'f',
    type: 'blockquote',
    text: 'Foxtrot',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({
          style: ITALIC,
          entity: null
        }),
        7
      )
    ),
  }),
];

const selectionState = new SelectionState({
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'e',
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

const editorState = EditorState.forceSelection(
  EditorState.createWithContent(contentState),
  selectionState
);

function getSampleStateForTestingNestedBlocks(): Object {
  return {
    editorState,
    contentState,
    selectionState
  };
}

module.exports = getSampleStateForTestingNestedBlocks;
