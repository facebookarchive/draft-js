/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

const Immutable = require('immutable');

const insertIntoList = require('insertIntoList');
const invariant = require('invariant');

const {Repeat} = Immutable;

import type CharacterMetadata from 'CharacterMetadata';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function insertTextIntoContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  text: string,
  characterMetadata: CharacterMetadata,
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    '`insertText` should only be called with a collapsed range.',
  );

  const len = text.length;
  if (!len) {
    return contentState;
  }

  const blockMap = contentState.getBlockMap();
  const key = selectionState.getStartKey();
  const offset = selectionState.getStartOffset();
  const block = blockMap.get(key);
  const blockText = block.getText();

  const newBlock = block.merge({
    text:
      blockText.slice(0, offset) +
      text +
      blockText.slice(offset, block.getLength()),
    characterList: insertIntoList(
      block.getCharacterList(),
      Repeat(characterMetadata, len).toList(),
      offset,
    ),
  });

  const newOffset = offset + len;

  return contentState.merge({
    blockMap: blockMap.set(key, newBlock),
    selectionAfter: selectionState.merge({
      anchorOffset: newOffset,
      focusOffset: newOffset,
    }),
  });
}

module.exports = insertTextIntoContentState;
