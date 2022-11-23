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
import type CharacterMetadata from 'CharacterMetadata';
import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const ContentBlockNode = require('ContentBlockNode');

const getNextDelimiterBlockKey = require('getNextDelimiterBlockKey');
const Immutable = require('immutable');

const {List, Map} = Immutable;

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

/**
 * Ancestors needs to be preserved when there are non selected
 * children to make sure we do not leave any orphans behind
 */
const getAncestorsKeys = (
  blockKey: ?string,
  blockMap: BlockMap,
): Array<string> => {
  const parents = [];

  if (!blockKey) {
    return parents;
  }

  let blockNode: ?(BlockNodeRecord | ContentBlock | ContentBlockNode) =
    blockMap.get(blockKey);
  while (blockNode && blockNode.getParentKey()) {
    const parentKey = blockNode.getParentKey();
    if (parentKey) {
      parents.push(parentKey);
    }
    blockNode = parentKey ? blockMap.get(parentKey) : null;
  }

  return parents;
};

/**
 * Get all next delimiter keys until we hit a root delimiter and return
 * an array of key references
 */
const getNextDelimitersBlockKeys = (
  block: ContentBlockNode,
  blockMap: BlockMap,
): Array<string> => {
  const nextDelimiters = [];

  if (!block) {
    return nextDelimiters;
  }

  let nextDelimiter = getNextDelimiterBlockKey(block, blockMap);
  while (nextDelimiter && blockMap.get(nextDelimiter)) {
    const block = blockMap.get(nextDelimiter);
    nextDelimiters.push(nextDelimiter);

    // we do not need to keep checking all root node siblings, just the first occurance
    nextDelimiter = block.getParentKey()
      ? getNextDelimiterBlockKey(block, blockMap)
      : null;
  }

  return nextDelimiters;
};

const getNextValidSibling = (
  block: ?ContentBlockNode,
  blockMap: BlockMap,
  originalBlockMap: BlockMap,
): ?string => {
  if (!block) {
    return null;
  }

  // note that we need to make sure we refer to the original block since this
  // function is called within a withMutations
  let nextValidSiblingKey = originalBlockMap
    .get(block.getKey())
    .getNextSiblingKey();

  while (nextValidSiblingKey && !blockMap.get(nextValidSiblingKey)) {
    nextValidSiblingKey =
      originalBlockMap.get(nextValidSiblingKey).getNextSiblingKey() || null;
  }

  return nextValidSiblingKey;
};

const getPrevValidSibling = (
  block: ?ContentBlockNode,
  blockMap: BlockMap,
  originalBlockMap: BlockMap,
): ?string => {
  if (!block) {
    return null;
  }

  // note that we need to make sure we refer to the original block since this
  // function is called within a withMutations
  let prevValidSiblingKey = originalBlockMap
    .get(block.getKey())
    .getPrevSiblingKey();

  while (prevValidSiblingKey && !blockMap.get(prevValidSiblingKey)) {
    prevValidSiblingKey =
      originalBlockMap.get(prevValidSiblingKey).getPrevSiblingKey() || null;
  }

  return prevValidSiblingKey;
};

const updateBlockMapLinks = (
  blockMap: BlockMap,
  startBlock: ContentBlockNode,
  endBlock: ContentBlockNode,
  originalBlockMap: BlockMap,
): BlockMap => {
  return blockMap.withMutations(blocks => {
    // update start block if its retained
    transformBlock(startBlock.getKey(), blocks, block =>
      block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
      }),
    );

    // update endblock if its retained
    transformBlock(endBlock.getKey(), blocks, block =>
      block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
      }),
    );

    // update start block parent ancestors
    getAncestorsKeys(startBlock.getKey(), originalBlockMap).forEach(parentKey =>
      transformBlock(parentKey, blocks, block =>
        block.merge({
          children: block.getChildKeys().filter(key => blocks.get(key)),
          nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
          prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
        }),
      ),
    );

    // update start block next - can only happen if startBlock == endBlock
    transformBlock(startBlock.getNextSiblingKey(), blocks, block =>
      block.merge({
        prevSibling: startBlock.getPrevSiblingKey(),
      }),
    );

    // update start block prev
    transformBlock(startBlock.getPrevSiblingKey(), blocks, block =>
      block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
      }),
    );

    // update end block next
    transformBlock(endBlock.getNextSiblingKey(), blocks, block =>
      block.merge({
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
      }),
    );

    // update end block prev
    transformBlock(endBlock.getPrevSiblingKey(), blocks, block =>
      block.merge({
        nextSibling: endBlock.getNextSiblingKey(),
      }),
    );

    // update end block parent ancestors
    getAncestorsKeys(endBlock.getKey(), originalBlockMap).forEach(parentKey => {
      transformBlock(parentKey, blocks, block =>
        block.merge({
          children: block.getChildKeys().filter(key => blocks.get(key)),
          nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
          prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
        }),
      );
    });

    // update next delimiters all the way to a root delimiter
    getNextDelimitersBlockKeys(endBlock, originalBlockMap).forEach(
      delimiterKey =>
        transformBlock(delimiterKey, blocks, block =>
          block.merge({
            nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
            prevSibling: getPrevValidSibling(block, blocks, originalBlockMap),
          }),
        ),
    );

    // if parent (startBlock) was deleted
    if (
      blockMap.get(startBlock.getKey()) == null &&
      blockMap.get(endBlock.getKey()) != null &&
      endBlock.getParentKey() === startBlock.getKey() &&
      endBlock.getPrevSiblingKey() == null
    ) {
      const prevSiblingKey = startBlock.getPrevSiblingKey();
      // endBlock becomes next sibling of parent's prevSibling
      transformBlock(endBlock.getKey(), blocks, block =>
        block.merge({
          prevSibling: prevSiblingKey,
        }),
      );
      transformBlock(prevSiblingKey, blocks, block =>
        block.merge({
          nextSibling: endBlock.getKey(),
        }),
      );

      // Update parent for previous parent's children, and children for that parent
      const prevSibling = prevSiblingKey ? blockMap.get(prevSiblingKey) : null;
      const newParentKey = prevSibling ? prevSibling.getParentKey() : null;
      startBlock.getChildKeys().forEach(childKey => {
        transformBlock(childKey, blocks, block =>
          block.merge({
            parent: newParentKey, // set to null if there is no parent
          }),
        );
      });
      if (newParentKey != null) {
        const newParent = blockMap.get(newParentKey);
        transformBlock(newParentKey, blocks, block =>
          block.merge({
            children: newParent
              .getChildKeys()
              .concat(startBlock.getChildKeys()),
          }),
        );
      }

      // last child of deleted parent should point to next sibling
      transformBlock(
        startBlock.getChildKeys().find(key => {
          const block = (blockMap.get(key): ContentBlockNode);
          return block.getNextSiblingKey() === null;
        }),
        blocks,
        block =>
          block.merge({
            nextSibling: startBlock.getNextSiblingKey(),
          }),
      );
    }
  });
};

const removeRangeFromContentState = (
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState => {
  if (selectionState.isCollapsed()) {
    return contentState;
  }

  const blockMap = contentState.getBlockMap();
  const startKey = selectionState.getStartKey();
  const startOffset = selectionState.getStartOffset();
  const endKey = selectionState.getEndKey();
  const endOffset = selectionState.getEndOffset();

  const startBlock = blockMap.get(startKey);
  const endBlock = blockMap.get(endKey);

  // we assume that ContentBlockNode and ContentBlocks are not mixed together
  const isExperimentalTreeBlock = startBlock instanceof ContentBlockNode;

  // used to retain blocks that should not be deleted to avoid orphan children
  let parentAncestors: Array<string> = [];

  if (isExperimentalTreeBlock) {
    const endBlockchildrenKeys = endBlock.getChildKeys();
    const endBlockAncestors = getAncestorsKeys(endKey, blockMap);

    // endBlock has unselected siblings so we can not remove its ancestors parents
    if (endBlock.getNextSiblingKey()) {
      parentAncestors = parentAncestors.concat(endBlockAncestors);
    }

    // endBlock has children so can not remove this block or any of its ancestors
    if (!endBlockchildrenKeys.isEmpty()) {
      parentAncestors = parentAncestors.concat(
        endBlockAncestors.concat([endKey]),
      );
    }

    // we need to retain all ancestors of the next delimiter block
    parentAncestors = parentAncestors.concat(
      getAncestorsKeys(getNextDelimiterBlockKey(endBlock, blockMap), blockMap),
    );
  }

  let characterList;

  if (startBlock === endBlock) {
    characterList = removeFromList(
      startBlock.getCharacterList(),
      startOffset,
      endOffset,
    );
  } else {
    characterList = startBlock
      .getCharacterList()
      .slice(0, startOffset)
      .concat(endBlock.getCharacterList().slice(endOffset));
  }

  const modifiedStart = startBlock.merge({
    text:
      startBlock.getText().slice(0, startOffset) +
      endBlock.getText().slice(endOffset),
    characterList,
  });

  // If cursor (collapsed) is at the start of the first child, delete parent
  // instead of child
  const shouldDeleteParent =
    isExperimentalTreeBlock &&
    startOffset === 0 &&
    endOffset === 0 &&
    endBlock.getParentKey() === startKey &&
    endBlock.getPrevSiblingKey() == null;
  const newBlocks = shouldDeleteParent
    ? Map([[startKey, null]])
    : blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .filter((_, k) => parentAncestors.indexOf(k) === -1)
        .concat(Map([[endKey, null]]))
        .map((_, k) => {
          return k === startKey ? modifiedStart : null;
        });
  // $FlowFixMe[incompatible-call] added when improving typing for this parameters
  let updatedBlockMap = blockMap.merge(newBlocks).filter(block => !!block);

  // Only update tree block pointers if the range is across blocks
  if (isExperimentalTreeBlock && startBlock !== endBlock) {
    updatedBlockMap = updateBlockMapLinks(
      updatedBlockMap,
      startBlock,
      endBlock,
      blockMap,
    );
  }

  return contentState.merge({
    blockMap: updatedBlockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset,
      isBackward: false,
    }),
  });
};

/**
 * Maintain persistence for target list when removing characters on the
 * head and tail of the character list.
 */
const removeFromList = (
  targetList: List<CharacterMetadata>,
  startOffset: number,
  endOffset: number,
): List<CharacterMetadata> => {
  if (startOffset === 0) {
    while (startOffset < endOffset) {
      targetList = targetList.shift();
      startOffset++;
    }
  } else if (endOffset === targetList.count()) {
    while (endOffset > startOffset) {
      targetList = targetList.pop();
      endOffset--;
    }
  } else {
    const head = targetList.slice(0, startOffset);
    const tail = targetList.slice(endOffset);
    targetList = head.concat(tail).toList();
  }
  return targetList;
};

module.exports = removeRangeFromContentState;
