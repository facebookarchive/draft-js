/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule insertFragmentIntoContentState
 * @format
 * @flow
 */

'use strict';

// TODO
// => once tests are passing refactor to make sure we pass the least amount of arguments
// to each of the bellow functions transforms

import type {BlockMap} from 'BlockMap';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';
import type {BlockNodeRecord} from 'BlockNodeRecord';

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlockNode = require('ContentBlockNode');
const Immutable = require('immutable');

const insertIntoList = require('insertIntoList');
const invariant = require('invariant');
const randomizeBlockMapKeys = require('randomizeBlockMapKeys');

const {List} = Immutable;

const updateExistingBlock = (
  contentState: ContentState,
  selectionState: SelectionState,
  blockMap: BlockMap,
  fragment: BlockMap,
  targetKey: string,
  targetOffset: number,
): ContentState => {
  const targetBlock = blockMap.get(targetKey);
  const pastedBlock = fragment.first();
  const text = targetBlock.getText();
  const chars = targetBlock.getCharacterList();
  const finalKey = targetKey;
  const finalOffset = targetOffset + pastedBlock.getText().length;

  const newBlock = targetBlock.merge({
    text:
      text.slice(0, targetOffset) +
      pastedBlock.getText() +
      text.slice(targetOffset),
    characterList: insertIntoList(
      chars,
      pastedBlock.getCharacterList(),
      targetOffset,
    ),
    data: pastedBlock.getData(),
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
  shouldNotUpdateFromFragmentBlock: boolean,
): BlockNodeRecord => {
  if (shouldNotUpdateFromFragmentBlock) {
    return block;
  }

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

// TODO fix flow
const getRootBlocks = (block: ContentBlockNode, blockMap: BlockMap): any => {
  const headKey = block.getKey();
  let rootBlock = block;
  let rootBlocks = [];

  // we need to account to when the head fragment block is merged with the target block
  if (blockMap.get(headKey)) {
    rootBlocks.push(headKey);
  }

  while (rootBlock && rootBlock.getNextSiblingKey()) {
    const lastSiblingKey = rootBlock.getNextSiblingKey();
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
  didNotMergeFirstFragmentBlockWithTargetBlock: boolean,
): BlockMap => {
  return blockMap.withMutations(blockMapState => {
    const targetKey = targetBlock.getKey();
    const headKey = fragmentHeadBlock.getKey();
    const targetNextKey = targetBlock.getNextSiblingKey();
    const targetParentKey = targetBlock.getParentKey();
    const fragmentRootBlocks = getRootBlocks(fragmentHeadBlock, blockMap);
    const lastRootFragmentBlockKey =
      fragmentRootBlocks[fragmentRootBlocks.length - 1];

    if (didNotMergeFirstFragmentBlockWithTargetBlock) {
      blockMapState.setIn([targetKey, 'nextSibling'], headKey);
      blockMapState.setIn([headKey, 'prevSibling'], targetKey);
    } else {
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

      const newChildrenArray = originalTargetParentChildKeys.toArray();

      // insert fragment children
      newChildrenArray.splice(insertionIndex, 0, ...fragmentRootBlocks);

      blockMapState.setIn(
        [targetParentKey, 'children'],
        new List(newChildrenArray),
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

  //
  // TODO - improve the bellow comment
  // the first fragment block's content is used to update the target block
  // we should not skip the first fragment block since we cannot merge the
  // target block with the first fragment block contents
  const startFragmentOffset = shouldNotUpdateFromFragmentBlock ? 0 : 1;

  // check here why the fragment block insertion seems messed up
  // on the snapshots the 'root' block is not appearing correct order
  blockMap.forEach((block, blockKey) => {
    if (blockKey !== targetKey) {
      newBlockArr.push(block);
      return;
    }

    // update head
    newBlockArr.push(
      updateHead(
        block,
        targetOffset,
        fragment,
        shouldNotUpdateFromFragmentBlock,
      ),
    );

    // Insert fragment blocks after the head and before the tail.
    fragment
      .slice(startFragmentOffset, fragmentSize - 1)
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
      shouldNotUpdateFromFragmentBlock,
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
      fragment,
      targetKey,
      targetOffset,
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
