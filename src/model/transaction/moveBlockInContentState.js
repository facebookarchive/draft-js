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
import type {DraftInsertionType} from 'DraftInsertionType';

const ContentBlockNode = require('ContentBlockNode');

const getNextDelimiterBlockKey = require('getNextDelimiterBlockKey');
const Immutable = require('immutable');
const invariant = require('invariant');

const {OrderedMap, List} = Immutable;

const transformBlock = (
  key: ?string,
  blockMap: BlockMap,
  func: (block: ContentBlockNode) => ContentBlockNode,
): void => {
  if (!key) {
    return;
  }

  const block = blockMap.get(key);

  if (!block) {
    return;
  }

  blockMap.set(key, func(block));
};

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
  const originalParentKey = originalBlockToBeMoved.getParentKey();
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
    transformBlock(originalParentKey, blocks, block => {
      const parentChildrenList = block.getChildKeys();
      return block.merge({
        children: parentChildrenList.delete(
          parentChildrenList.indexOf(originalBlockKey),
        ),
      });
    });

    // update old prev
    transformBlock(originalPrevSiblingKey, blocks, block =>
      block.merge({
        nextSibling: originalNextSiblingKey,
      }),
    );

    // update old next
    transformBlock(originalNextSiblingKey, blocks, block =>
      block.merge({
        prevSibling: originalPrevSiblingKey,
      }),
    );

    // update new next
    transformBlock(newNextSiblingKey, blocks, block =>
      block.merge({
        prevSibling: originalBlockKey,
      }),
    );

    // update new prev
    transformBlock(newPrevSiblingKey, blocks, block =>
      block.merge({
        nextSibling: originalBlockKey,
      }),
    );

    // update new parent
    transformBlock(newParentKey, blocks, block => {
      const newParentChildrenList = block.getChildKeys();
      const targetBlockIndex = newParentChildrenList.indexOf(originalTargetKey);

      const insertionIndex = isInsertedAfterTarget
        ? targetBlockIndex + 1
        : targetBlockIndex !== 0
        ? targetBlockIndex - 1
        : 0;

      const newChildrenArray = newParentChildrenList.toArray();
      newChildrenArray.splice(insertionIndex, 0, originalBlockKey);

      return block.merge({
        children: List(newChildrenArray),
      });
    });

    // update block
    transformBlock(originalBlockKey, blocks, block =>
      block.merge({
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

  let blocksToBeMoved: Array<BlockNodeRecord> = [blockToBeMoved];
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

  let newBlocks = OrderedMap<string, BlockNodeRecord>();

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
