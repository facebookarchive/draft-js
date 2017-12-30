/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleStateForTesting
 * @format
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const DraftEntityInstance = require('DraftEntityInstance');
const Immutable = require('immutable');
const SampleDraftInlineStyle = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');

var {BOLD, ITALIC, NONE} = SampleDraftInlineStyle;
var ENTITY_KEY = Immutable.OrderedSet.of('123');

const BLOCKS = [
  new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: 'Alpha',
    characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.EMPTY, 5)),
  }),
  new ContentBlock({
    key: 'b',
    type: 'unordered-list-item',
    text: 'Bravo',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({style: BOLD, entity: ENTITY_KEY}),
        5,
      ),
    ),
  }),
  new ContentBlock({
    key: 'c',
    type: 'code-block',
    text: 'Test',
    characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.EMPTY, 4)),
  }),
  new ContentBlock({
    key: 'd',
    type: 'code-block',
    text: '',
    characterList: Immutable.List(),
  }),
  new ContentBlock({
    key: 'e',
    type: 'code-block',
    text: '',
    characterList: Immutable.List(),
  }),
  new ContentBlock({
    key: 'f',
    type: 'blockquote',
    text: 'Charlie',
    characterList: Immutable.List(
      Immutable.Repeat(
        CharacterMetadata.create({style: ITALIC, entity: NONE}),
        7,
      ),
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
  entityMap: Immutable.OrderedMap({
    '123': new DraftEntityInstance({
      type: 'IMAGE',
      mutability: 'IMMUTABLE',
      data: {},
    }),
  }),
  selectionBefore: selectionState,
  selectionAfter: selectionState,
});

let editorState = EditorState.createWithContent(contentState);
editorState = EditorState.forceSelection(editorState, selectionState);

const getSampleStateForTesting = (): Object => {
  return {editorState, contentState, selectionState};
};

module.exports = getSampleStateForTesting;
