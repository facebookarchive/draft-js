/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule moveBlockInContentState
 * @format
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {DraftInsertionType} from 'DraftInsertionType';

const ContentBlockNode = require('ContentBlockNode');
const Immutable = require('immutable');

const getNextDelimiterBlockKey = require('getNextDelimiterBlockKey');
const invariant = require('invariant');

const {OrderedMap, List} = Immutable;

const updateBlockMapLinks = (
  blockMap: BlockMap,
  originalBlockToBeMoved: BlockNodeRecord,
  originalTargetBlock: BlockNodeRecord,
  insertionMode: DraftInsertionType,
  isExperimentalTreeBlock: boolean,
): BlockMap => {
  if (!isExperimentalTreeBlock) {
    return blockMap;
  }
  // possible values of 'insertionMode' are: 'after', 'before'
  const isInsertedAfterTarget = insertionMode === 'after';

  const originalBlockKey = originalBlockToBeMoved.getKey();
  const originalTargetKey = originalTargetBlock.getKey();
  const originialParentKey = originalBlockToBeMoved.getParentKey();
  const originalNextSiblingKey = originalBlockToBeMoved.getNextSiblingKey();
  const originalPrevSiblingKey = originalBlockToBeMoved.getPrevSiblingKey();
  const newParentKey = originalTargetBlock.getParentKey();
  const newNextSiblingKey = isInsertedAfterTarget
    ? originalTargetBlock.getNextSiblingKey()
    : originalTargetKey;
  const newPrevSiblingKey = isInsertedAfterTarget
    ? originalTargetKey
    : originalTargetBlock.getPrevSiblingKey();

  return blockMap.withMutations(blocks => {
    // update old parent
    if (originialParentKey) {
      const originialParentBlock = blocks.get(originialParentKey);
      const parentChildrenList = originialParentBlock.getChildKeys();
      blocks.mergeIn(
        originialParentKey,
        originialParentBlock.merge({
          children: parentChildrenList.delete(
            parentChildrenList.indexOf(originalBlockKey),
          ),
        }),
      );
    }

    // update old prev
    if (originalPrevSiblingKey) {
      const originalPrevSiblingBlock = blocks.get(originalPrevSiblingKey);
      blocks.mergeIn(
        originalPrevSiblingKey,
        originalPrevSiblingBlock.merge({
          nextSibling: originalBlockToBeMoved.getNextSiblingKey(),
        }),
      );
    }

    // update old next
    if (originalNextSiblingKey) {
      const originalNextSiblingBlock = blocks.get(originalNextSiblingKey);
      blocks.mergeIn(
        originalNextSiblingKey,
        originalNextSiblingBlock.merge({
          prevSibling: originalBlockToBeMoved.getPrevSiblingKey(),
        }),
      );
    }

    // update new next
    if (newNextSiblingKey) {
      const newNextSiblingBlock = blocks.get(newNextSiblingKey);
      blocks.mergeIn(
        newNextSiblingKey,
        newNextSiblingBlock.merge({
          prevSibling: originalBlockKey,
        }),
      );
    }

    // update new prev
    if (newPrevSiblingKey) {
      const newPrevSiblingBlock = blocks.get(newPrevSiblingKey);
      blocks.mergeIn(
        newPrevSiblingKey,
        newPrevSiblingBlock.merge({
          nextSibling: originalBlockKey,
        }),
      );
    }

    // update new parent
    if (newParentKey) {
      const newParentBlock = blocks.get(newParentKey);
      const newParentChildrenList = newParentBlock.getChildKeys();
      const targetBlockIndex = newParentChildrenList.indexOf(originalTargetKey);

      const insertionIndex = isInsertedAfterTarget
        ? targetBlockIndex + 1
        : targetBlockIndex !== 0 ? targetBlockIndex - 1 : 0;

      const newChildrenArray = newParentChildrenList.toArray();
      newChildrenArray.splice(insertionIndex, 0, originalBlockKey);

      blocks.mergeIn(
        newParentKey,
        newParentBlock.merge({
          children: List(newChildrenArray),
        }),
      );
    }

    // update block
    blocks.mergeIn(
      originalBlockKey,
      originalBlockToBeMoved.merge({
        nextSibling: newNextSiblingKey,
        prevSibling: newPrevSiblingKey,
        parent: newParentKey,
      }),
    );
  });
};

const moveBlockInContentState = (
  contentState: ContentState,
  blockToBeMoved: BlockNodeRecord,
  targetBlock: BlockNodeRecord,
  insertionMode: DraftInsertionType,
): ContentState => {
  invariant(insertionMode !== 'replace', 'Replacing blocks is not supported.');

  const targetKey = targetBlock.getKey();
  const blockKey = blockToBeMoved.getKey();

  invariant(blockKey !== targetKey, 'Block cannot be moved next to itself.');

  const blockMap = contentState.getBlockMap();
  const isExperimentalTreeBlock = blockToBeMoved instanceof ContentBlockNode;

  let blocksToBeMoved = [blockToBeMoved];
  let blockMapWithoutBlocksToBeMoved = blockMap.delete(blockKey);

  if (isExperimentalTreeBlock) {
    blocksToBeMoved = [];
    blockMapWithoutBlocksToBeMoved = blockMap.withMutations(blocks => {
      const nextSiblingKey = blockToBeMoved.getNextSiblingKey();
      const nextDelimiterBlockKey = getNextDelimiterBlockKey(
        blockToBeMoved,
        blocks,
      );

      blocks
        .toSeq()
        .skipUntil(block => block.getKey() === blockKey)
        .takeWhile(block => {
          const key = block.getKey();
          const isBlockToBeMoved = key === blockKey;
          const hasNextSiblingAndIsNotNextSibling =
            nextSiblingKey && key !== nextSiblingKey;
          const doesNotHaveNextSiblingAndIsNotDelimiter =
            !nextSiblingKey &&
            block.getParentKey() &&
            (!nextDelimiterBlockKey || key !== nextDelimiterBlockKey);

          return !!(
            isBlockToBeMoved ||
            hasNextSiblingAndIsNotNextSibling ||
            doesNotHaveNextSiblingAndIsNotDelimiter
          );
        })
        .forEach(block => {
          blocksToBeMoved.push(block);
          blocks.delete(block.getKey());
        });
    });
  }

  const blocksBefore = blockMapWithoutBlocksToBeMoved
    .toSeq()
    .takeUntil(v => v === targetBlock);

  const blocksAfter = blockMapWithoutBlocksToBeMoved
    .toSeq()
    .skipUntil(v => v === targetBlock)
    .skip(1);

  const slicedBlocks = blocksToBeMoved.map(block => [block.getKey(), block]);

  let newBlocks = OrderedMap();

  if (insertionMode === 'before') {
    const blockBefore = contentState.getBlockBefore(targetKey);

    invariant(
      !blockBefore || blockBefore.getKey() !== blockToBeMoved.getKey(),
      'Block cannot be moved next to itself.',
    );

    newBlocks = blocksBefore
      .concat([...slicedBlocks, [targetKey, targetBlock]], blocksAfter)
      .toOrderedMap();
  } else if (insertionMode === 'after') {
    const blockAfter = contentState.getBlockAfter(targetKey);

    invariant(
      !blockAfter || blockAfter.getKey() !== blockKey,
      'Block cannot be moved next to itself.',
    );

    newBlocks = blocksBefore
      .concat([[targetKey, targetBlock], ...slicedBlocks], blocksAfter)
      .toOrderedMap();
  }

  return contentState.merge({
    blockMap: updateBlockMapLinks(
      newBlocks,
      blockToBeMoved,
      targetBlock,
      insertionMode,
      isExperimentalTreeBlock,
    ),
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: contentState.getSelectionAfter().merge({
      anchorKey: blockKey,
      focusKey: blockKey,
    }),
  });
};

module.exports = moveBlockInContentState;
