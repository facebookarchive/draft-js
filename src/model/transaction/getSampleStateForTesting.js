/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import * as BlockMapBuilder from 'BlockMapBuilder';
import CharacterMetadata from 'CharacterMetadata';
import ContentBlock from 'ContentBlock';
import ContentState from 'ContentState';
import EditorState from 'EditorState';
import {BOLD, ITALIC} from 'SampleDraftInlineStyle';
import SelectionState from 'SelectionState';

import Immutable from 'immutable';

const ENTITY_KEY = '2';

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
        CharacterMetadata.create({style: ITALIC, entity: null}),
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
  entityMap: Immutable.OrderedMap(),
  selectionBefore: selectionState,
  selectionAfter: selectionState,
}).createEntity({
  type: 'IMAGE',
  mutability: 'IMMUTABLE',
  data: null,
});

let editorState = EditorState.createWithContent(contentState);
editorState = EditorState.forceSelection(editorState, selectionState);

export default function getSampleStateForTesting(): {|
  editorState: EditorState,
  contentState: ContentState,
  selectionState: SelectionState,
|} {
  return {editorState, contentState, selectionState};
}
