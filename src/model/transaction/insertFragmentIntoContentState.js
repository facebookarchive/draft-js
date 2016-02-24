/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule insertFragmentIntoContentState
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');

const generateBlockKey = require('generateBlockKey');
const insertIntoList = require('insertIntoList');
const invariant = require('invariant');

import type {BlockMap} from 'BlockMap';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

function insertFragmentIntoContentState(
  contentState: ContentState,
  selectionState: SelectionState,
  fragment: BlockMap
): ContentState {
  invariant(
    selectionState.isCollapsed(),
    '`insertFragment` should only be called with a collapsed selection state.'
  );

  const targetKey = selectionState.getStartKey();
  const targetOffset = selectionState.getStartOffset();

  let blockMap = contentState.getBlockMap();

  const fragmentSize = fragment.size;
  let finalKey;
  let finalOffset;

  if (fragmentSize === 1) {
    const targetBlock = blockMap.get(targetKey);
    const pastedBlock = fragment.first();
    const text = targetBlock.getText();
    const chars = targetBlock.getCharacterList();

    const newBlock = targetBlock.merge({
      text: (
        text.slice(0, targetOffset) +
        pastedBlock.getText() +
        text.slice(targetOffset)
      ),
      characterList: insertIntoList(
        chars,
        pastedBlock.getCharacterList(),
        targetOffset
      ),
    });

    blockMap = blockMap.set(targetKey, newBlock);

    finalKey = targetKey;
    finalOffset = targetOffset + pastedBlock.getText().length;

    return contentState.merge({
      blockMap: blockMap.set(targetKey, newBlock),
      selectionBefore: selectionState,
      selectionAfter: selectionState.merge({
        anchorKey: finalKey,
        anchorOffset: finalOffset,
        focusKey: finalKey,
        focusOffset: finalOffset,
        isBackward: false,
      }),
    });
  }

  const newBlockArr = [];

  contentState.getBlockMap().forEach(
    (block, blockKey) => {
      if (blockKey !== targetKey) {
        newBlockArr.push(block);
        return;
      }

      const text = block.getText();
      const chars = block.getCharacterList();

      // Modify head portion of block.
      const blockSize = text.length;
      const headText = text.slice(0, targetOffset);
      const headCharacters = chars.slice(0, targetOffset);
      const appendToHead = fragment.first();

      const modifiedHead = block.merge({
        text: headText + appendToHead.getText(),
        characterList: headCharacters.concat(appendToHead.getCharacterList()),
      });

      newBlockArr.push(modifiedHead);

      // Insert fragment blocks after the head and before the tail.
      fragment.slice(1, fragmentSize - 1).forEach(
        fragmentBlock => {
          newBlockArr.push(fragmentBlock.set('key', generateBlockKey()));
        }
      );

      // Modify tail portion of block.
      const tailText = text.slice(targetOffset, blockSize);
      const tailCharacters = chars.slice(targetOffset, blockSize);
      const prependToTail = fragment.last();
      finalKey = generateBlockKey();

      const modifiedTail = prependToTail.merge({
        key: finalKey,
        text: prependToTail.getText() + tailText,
        characterList: prependToTail
          .getCharacterList()
          .concat(tailCharacters),
      });

      newBlockArr.push(modifiedTail);
    }
  );

  finalOffset = fragment.last().getLength();

  return contentState.merge({
    blockMap: BlockMapBuilder.createFromArray(newBlockArr),
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: finalKey,
      anchorOffset: finalOffset,
      focusKey: finalKey,
      focusOffset: finalOffset,
      isBackward: false,
    }),
  });
}

module.exports = insertFragmentIntoContentState;
