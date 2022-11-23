/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */
import type {BlockMap} from 'BlockMap';
import type {BlockNodeKey} from 'BlockNode';
import type ContentBlockNode from 'ContentBlockNode';

const warning = require('warning');

const DraftTreeInvariants = {
  /**
   * Check if the block is valid
   */
  isValidBlock(block: ContentBlockNode, blockMap: BlockMap): boolean {
    const key = block.getKey();
    // is its parent's child
    const parentKey = block.getParentKey();
    if (parentKey != null) {
      const parent = blockMap.get(parentKey);
      if (!parent.getChildKeys().includes(key)) {
        warning(true, 'Tree is missing parent -> child pointer on %s', key);
        return false;
      }
    }

    // is its children's parent
    const children = block.getChildKeys().map(k => blockMap.get(k));
    if (!children.every(c => c.getParentKey() === key)) {
      warning(true, 'Tree is missing child -> parent pointer on %s', key);
      return false;
    }

    // is its previous sibling's next sibling
    const prevSiblingKey = block.getPrevSiblingKey();
    if (prevSiblingKey != null) {
      const prevSibling = blockMap.get(prevSiblingKey);
      if (prevSibling.getNextSiblingKey() !== key) {
        warning(
          true,
          "Tree is missing nextSibling pointer on %s's prevSibling",
          key,
        );
        return false;
      }
    }

    // is its next sibling's previous sibling
    const nextSiblingKey = block.getNextSiblingKey();
    if (nextSiblingKey != null) {
      const nextSibling = blockMap.get(nextSiblingKey);
      if (nextSibling.getPrevSiblingKey() !== key) {
        warning(
          true,
          "Tree is missing prevSibling pointer on %s's nextSibling",
          key,
        );
        return false;
      }
    }

    // no 2-node cycles
    if (nextSiblingKey !== null && prevSiblingKey !== null) {
      if (prevSiblingKey === nextSiblingKey) {
        warning(true, 'Tree has a two-node cycle at %s', key);
        return false;
      }
    }

    // if it's a leaf node, it has text but no children
    if (block.text != '') {
      if (block.getChildKeys().size > 0) {
        warning(true, 'Leaf node %s has children', key);
        return false;
      }
    }
    return true;
  },

  /**
   * Checks that this is a connected tree on all the blocks
   * starting from the first block, traversing nextSibling and child pointers
   * should be a tree (preorder traversal - parent, then children)
   * num of connected node === number of blocks
   */
  isConnectedTree(blockMap: BlockMap): boolean {
    // exactly one node has no previous sibling + no parent
    const eligibleFirstNodes = blockMap
      .toArray()
      .filter(
        block =>
          block.getParentKey() == null && block.getPrevSiblingKey() == null,
      );
    if (eligibleFirstNodes.length !== 1) {
      warning(true, 'Tree is not connected. More or less than one first node');
      return false;
    }
    const firstNode = eligibleFirstNodes.shift();
    let nodesSeen = 0;
    let currentKey: ?($FlowFixMe | BlockNodeKey) = firstNode.getKey();
    const visitedStack: Array<$FlowFixMe | BlockNodeKey> = [];
    while (currentKey != null) {
      const currentNode = blockMap.get(currentKey);
      const childKeys = currentNode.getChildKeys();
      const nextSiblingKey = currentNode.getNextSiblingKey();
      // if the node has children, add parent's next sibling to stack and go to children
      if (childKeys.size > 0) {
        if (nextSiblingKey != null) {
          visitedStack.unshift(nextSiblingKey);
        }
        const children = childKeys.map(k => blockMap.get(k));
        const firstNode = children.find(
          block => block.getPrevSiblingKey() == null,
        );
        if (firstNode == null) {
          warning(true, '%s has no first child', currentKey);
          return false;
        }
        currentKey = firstNode.getKey();
        // TODO(T32490138): Deal with multi-node cycles here
      } else {
        if (currentNode.getNextSiblingKey() != null) {
          currentKey = currentNode.getNextSiblingKey();
        } else {
          currentKey = visitedStack.shift();
        }
      }
      nodesSeen++;
    }

    if (nodesSeen !== blockMap.size) {
      warning(
        true,
        'Tree is not connected. %s nodes were seen instead of %s',
        nodesSeen,
        blockMap.size,
      );
      return false;
    }

    return true;
  },

  /**
   * Checks that the block map is a connected tree with valid blocks
   */
  isValidTree(blockMap: BlockMap): boolean {
    const blocks = blockMap.toArray();
    if (
      !blocks.every(block => DraftTreeInvariants.isValidBlock(block, blockMap))
    ) {
      return false;
    }
    return DraftTreeInvariants.isConnectedTree(blockMap);
  },
};

module.exports = DraftTreeInvariants;
