/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');

const Immutable = require('immutable');
const insertIntoList = require('insertIntoList');
const invariant = require('invariant');
const randomizeBlockMapKeys = require('randomizeBlockMapKeys');

const {List} = Immutable;

export type BlockDataMergeBehavior =
  | 'REPLACE_WITH_NEW_DATA'
  | 'MERGE_OLD_DATA_TO_NEW_DATA';

const updateExistingBlock = (
  contentState: ContentState,
  selectionState: SelectionState,
  blockMap: BlockMap,
  fragmentBlock: BlockNodeRecord,
  targetKey: string,
  targetOffset: number,
  mergeBlockData?: BlockDataMergeBehavior = 'REPLACE_WITH_NEW_DATA',
): ContentState => {
  const targetBlock = blockMap.get(targetKey);
  const text = targetBlock.getText();
  const chars = targetBlock.getCharacterList();
  const finalKey = targetKey;
  const finalOffset = targetOffset + fragmentBlock.getText().length;

  let data = null;

  switch (mergeBlockData) {
    case 'MERGE_OLD_DATA_TO_NEW_DATA':
      data = fragmentBlock.getData().merge(targetBlock.getData());
      break;
    case 'REPLACE_WITH_NEW_DATA':
      data = fragmentBlock.getData();
      break;
  }

  let type = targetBlock.getType();
  if (text && type === 'unstyled') {
    type = fragmentBlock.getType();
  }

  const newBlock = targetBlock.merge({
    text:
      text.slice(0, targetOffset) +
      fragmentBlock.getText() +
      text.slice(targetOffset),
    characterList: insertIntoList(
      chars,
      fragmentBlock.getCharacterList(),
      targetOffset,
    ),
    type,
    data,
  });

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
};

/**
 * Appends text/characterList from the fragment first block to
 * target block.
 */
const updateHead = (
  block: BlockNodeRecord,
  targetOffset: number,
  fragment: BlockMap,
): BlockNodeRecord => {
  const text = block.getText();
  const chars = block.getCharacterList();

  // Modify head portion of block.
  const headText = text.slice(0, targetOffset);
  const headCharacters = chars.slice(0, targetOffset);
  const appendToHead = fragment.first();

  return block.merge({
    text: headText + appendToHead.getText(),
    characterList: headCharacters.concat(appendToHead.getCharacterList()),
    type: headText ? block.getType() : appendToHead.getType(),
    data: appendToHead.getData(),
  });
};

/**
 * Appends offset text/characterList from the target block to the last
 * fragment block.
 */
const updateTail = (
  block: BlockNodeRecord,
  targetOffset: number,
  fragment: BlockMap,
): BlockNodeRecord => {
  // Modify tail portion of block.
  const text = block.getText();
  const chars = block.getCharacterList();

  // Modify head portion of block.
  const blockSize = text.length;
  const tailText = text.slice(targetOffset, blockSize);
  const tailCharacters = chars.slice(targetOffset, blockSize);
  const prependToTail = fragment.last();

  return prependToTail.merge({
    text: prependToTail.getText() + tailText,
    characterList: prependToTail.getCharacterList().concat(tailCharacters),
    data: prependToTail.getData(),
  });
};

const getRootBlocks = (
  block: ContentBlockNode,
  blockMap: BlockMap,
): Array<string> => {
  const headKey = block.getKey();
  let rootBlock = block;
  const rootBlocks = [];

  // sometimes the fragment head block will not be part of the blockMap itself this can happen when
  // the fragment head is used to update the target block, however when this does not happen we need
  // to make sure that we include it on the rootBlocks since the first block of a fragment is always a
  // fragment root block
  if (blockMap.get(headKey)) {
    rootBlocks.push(headKey);
  }

  while (rootBlock && rootBlock.getNextSiblingKey()) {
    const lastSiblingKey = rootBlock.getNextSiblingKey();

    if (!lastSiblingKey) {
      break;
    }

    rootBlocks.push(lastSiblingKey);
    rootBlock = blockMap.get(lastSiblingKey);
  }

  return rootBlocks;
};

const updateBlockMapLinks = (
  blockMap: BlockMap,
  originalBlockMap: BlockMap,
  targetBlock: ContentBlockNode,
  fragmentHeadBlock: ContentBlockNode,
): BlockMap => {
  return blockMap.withMutations(blockMapState => {
    const targetKey = targetBlock.getKey();
    const headKey = fragmentHeadBlock.getKey();
    const targetNextKey = targetBlock.getNextSiblingKey();
    const targetParentKey = targetBlock.getParentKey();
    const fragmentRootBlocks = getRootBlocks(fragmentHeadBlock, blockMap);
    const lastRootFragmentBlockKey =
      fragmentRootBlocks[fragmentRootBlocks.length - 1];

    if (blockMapState.get(headKey)) {
      // update the fragment head when it is part of the blockMap otherwise
      blockMapState.setIn([targetKey, 'nextSibling'], headKey);
      blockMapState.setIn([headKey, 'prevSibling'], targetKey);
    } else {
      // update the target block that had the fragment head contents merged into it
      blockMapState.setIn(
        [targetKey, 'nextSibling'],
        fragmentHeadBlock.getNextSiblingKey(),
      );
      blockMapState.setIn(
        [fragmentHeadBlock.getNextSiblingKey(), 'prevSibling'],
        targetKey,
      );
    }

    // update the last root block fragment
    blockMapState.setIn(
      [lastRootFragmentBlockKey, 'nextSibling'],
      targetNextKey,
    );

    // update the original target next block
    if (targetNextKey) {
      blockMapState.setIn(
        [targetNextKey, 'prevSibling'],
        lastRootFragmentBlockKey,
      );
    }

    // update fragment parent links
    fragmentRootBlocks.forEach(blockKey =>
      blockMapState.setIn([blockKey, 'parent'], targetParentKey),
    );

    // update targetBlock parent child links
    if (targetParentKey) {
      const targetParent = blockMap.get(targetParentKey);
      const originalTargetParentChildKeys = targetParent.getChildKeys();

      const targetBlockIndex = originalTargetParentChildKeys.indexOf(targetKey);
      const insertionIndex = targetBlockIndex + 1;

      const newChildrenKeysArray = originalTargetParentChildKeys.toArray();

      // insert fragment children
      newChildrenKeysArray.splice(insertionIndex, 0, ...fragmentRootBlocks);

      blockMapState.setIn(
        [targetParentKey, 'children'],
        List(newChildrenKeysArray),
      );
    }
  });
};

const insertFragment = (
  contentState: ContentState,
  selectionState: SelectionState,
  blockMap: BlockMap,
  fragment: BlockMap,
  targetKey: string,
  targetOffset: number,
): ContentState => {
  const isTreeBasedBlockMap = blockMap.first() instanceof ContentBlockNode;
  const newBlockArr = [];
  const fragmentSize = fragment.size;
  const target = blockMap.get(targetKey);
  const head = fragment.first();
  const tail = fragment.last();
  const finalOffset = tail.getLength();
  const finalKey = tail.getKey();
  const shouldNotUpdateFromFragmentBlock =
    isTreeBasedBlockMap &&
    (!target.getChildKeys().isEmpty() || !head.getChildKeys().isEmpty());

  blockMap.forEach((block, blockKey) => {
    if (blockKey !== targetKey) {
      newBlockArr.push(block);
      return;
    }

    if (shouldNotUpdateFromFragmentBlock) {
      newBlockArr.push(block);
    } else {
      newBlockArr.push(updateHead(block, targetOffset, fragment));
    }

    // Insert fragment blocks after the head and before the tail.
    fragment
      // when we are updating the target block with the head fragment block we skip the first fragment
      // head since its contents have already been merged with the target block otherwise we include
      // the whole fragment
      .slice(shouldNotUpdateFromFragmentBlock ? 0 : 1, fragmentSize - 1)
      .forEach(fragmentBlock => newBlockArr.push(fragmentBlock));

    // update tail
    newBlockArr.push(updateTail(block, targetOffset, fragment));
  });

  let updatedBlockMap = BlockMapBuilder.createFromArray(newBlockArr);

  if (isTreeBasedBlockMap) {
    updatedBlockMap = updateBlockMapLinks(
      updatedBlockMap,
      blockMap,
      target,
      head,
    );
  }

  return contentState.merge({
    blockMap: updatedBlockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: finalKey,
      anchorOffset: finalOffset,
      focusKey: finalKey,
      focusOffset: finalOffset,
      isBackward: false,
    }),
  });
};

const insertFragmentIntoContentState = (
  contentState: ContentState,
  selectionState: SelectionState,
  fragmentBlockMap: BlockMap,
  mergeBlockData?: BlockDataMergeBehavior = 'REPLACE_WITH_NEW_DATA',
): ContentState => {
  invariant(
    selectionState.isCollapsed(),
    '`insertFragment` should only be called with a collapsed selection state.',
  );

  const blockMap = contentState.getBlockMap();
  const fragment = randomizeBlockMapKeys(fragmentBlockMap);
  const targetKey = selectionState.getStartKey();
  const targetOffset = selectionState.getStartOffset();

  const targetBlock = blockMap.get(targetKey);

  if (targetBlock instanceof ContentBlockNode) {
    invariant(
      targetBlock.getChildKeys().isEmpty(),
      '`insertFragment` should not be called when a container node is selected.',
    );
  }

  // When we insert a fragment with a single block we simply update the target block
  // with the contents of the inserted fragment block
  if (fragment.size === 1) {
    return updateExistingBlock(
      contentState,
      selectionState,
      blockMap,
      fragment.first(),
      targetKey,
      targetOffset,
      mergeBlockData,
    );
  }

  return insertFragment(
    contentState,
    selectionState,
    blockMap,
    fragment,
    targetKey,
    targetOffset,
  );
};

module.exports = insertFragmentIntoContentState;
