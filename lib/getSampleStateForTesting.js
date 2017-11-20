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
 * 
 */

'use strict';

var BlockMapBuilder = require('./BlockMapBuilder');
var CharacterMetadata = require('./CharacterMetadata');
var ContentBlock = require('./ContentBlock');
var ContentState = require('./ContentState');
var EditorState = require('./EditorState');
var Immutable = require('immutable');
var SampleDraftInlineStyle = require('./SampleDraftInlineStyle');
var SelectionState = require('./SelectionState');

var BOLD = SampleDraftInlineStyle.BOLD,
    ITALIC = SampleDraftInlineStyle.ITALIC;

var ENTITY_KEY = '1';

var BLOCKS = [new ContentBlock({
  key: 'a',
  type: 'unstyled',
  text: 'Alpha',
  characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.EMPTY, 5))
}), new ContentBlock({
  key: 'b',
  type: 'unordered-list-item',
  text: 'Bravo',
  characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.create({ style: BOLD, entity: ENTITY_KEY }), 5))
}), new ContentBlock({
  key: 'c',
  type: 'code-block',
  text: 'Test',
  characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.EMPTY, 4))
}), new ContentBlock({
  key: 'd',
  type: 'code-block',
  text: '',
  characterList: Immutable.List()
}), new ContentBlock({
  key: 'e',
  type: 'code-block',
  text: '',
  characterList: Immutable.List()
}), new ContentBlock({
  key: 'f',
  type: 'blockquote',
  text: 'Charlie',
  characterList: Immutable.List(Immutable.Repeat(CharacterMetadata.create({ style: ITALIC, entity: null }), 7))
})];

var selectionState = new SelectionState({
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
  hasFocus: true
});

var blockMap = BlockMapBuilder.createFromArray(BLOCKS);
var contentState = new ContentState({
  blockMap: blockMap,
  entityMap: Immutable.OrderedMap(),
  selectionBefore: selectionState,
  selectionAfter: selectionState
}).createEntity({
  type: 'IMAGE',
  mutability: 'IMMUTABLE',
  data: null
});

var editorState = EditorState.createWithContent(contentState);
editorState = EditorState.forceSelection(editorState, selectionState);

var getSampleStateForTesting = function getSampleStateForTesting() {
  return { editorState: editorState, contentState: contentState, selectionState: selectionState };
};

module.exports = getSampleStateForTesting;