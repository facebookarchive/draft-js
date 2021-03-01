"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
var warning = require("fbjs/lib/warning");

var DraftTreeInvariants = {
  /**
   * Check if the block is valid
   */
  isValidBlock: function isValidBlock(block, blockMap) {
    var key = block.getKey(); // is its parent's child

    var parentKey = block.getParentKey();

    if (parentKey != null) {
      var parent = blockMap.get(parentKey);

      if (!parent.getChildKeys().includes(key)) {
        process.env.NODE_ENV !== "production" ? warning(true, 'Tree is missing parent -> child pointer on %s', key) : void 0;
        return false;
      }
    } // is its children's parent


    var children = block.getChildKeys().map(function (k) {
      return blockMap.get(k);
    });

    if (!children.every(function (c) {
      return c.getParentKey() === key;
    })) {
      process.env.NODE_ENV !== "production" ? warning(true, 'Tree is missing child -> parent pointer on %s', key) : void 0;
      return false;
    } // is its previous sibling's next sibling


    var prevSiblingKey = block.getPrevSiblingKey();

    if (prevSiblingKey != null) {
      var prevSibling = blockMap.get(prevSiblingKey);

      if (prevSibling.getNextSiblingKey() !== key) {
        process.env.NODE_ENV !== "production" ? warning(true, "Tree is missing nextSibling pointer on %s's prevSibling", key) : void 0;
        return false;
      }
    } // is its next sibling's previous sibling


    var nextSiblingKey = block.getNextSiblingKey();

    if (nextSiblingKey != null) {
      var nextSibling = blockMap.get(nextSiblingKey);

      if (nextSibling.getPrevSiblingKey() !== key) {
        process.env.NODE_ENV !== "production" ? warning(true, "Tree is missing prevSibling pointer on %s's nextSibling", key) : void 0;
        return false;
      }
    } // no 2-node cycles


    if (nextSiblingKey !== null && prevSiblingKey !== null) {
      if (prevSiblingKey === nextSiblingKey) {
        process.env.NODE_ENV !== "production" ? warning(true, 'Tree has a two-node cycle at %s', key) : void 0;
        return false;
      }
    } // if it's a leaf node, it has text but no children


    if (block.text != '') {
      if (block.getChildKeys().size > 0) {
        process.env.NODE_ENV !== "production" ? warning(true, 'Leaf node %s has children', key) : void 0;
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
  isConnectedTree: function isConnectedTree(blockMap) {
    // exactly one node has no previous sibling + no parent
    var eligibleFirstNodes = blockMap.toArray().filter(function (block) {
      return block.getParentKey() == null && block.getPrevSiblingKey() == null;
    });

    if (eligibleFirstNodes.length !== 1) {
      process.env.NODE_ENV !== "production" ? warning(true, 'Tree is not connected. More or less than one first node') : void 0;
      return false;
    }

    var firstNode = eligibleFirstNodes.shift();
    var nodesSeen = 0;
    var currentKey = firstNode.getKey();
    var visitedStack = [];

    while (currentKey != null) {
      var currentNode = blockMap.get(currentKey);
      var childKeys = currentNode.getChildKeys();
      var nextSiblingKey = currentNode.getNextSiblingKey(); // if the node has children, add parent's next sibling to stack and go to children

      if (childKeys.size > 0) {
        if (nextSiblingKey != null) {
          visitedStack.unshift(nextSiblingKey);
        }

        var children = childKeys.map(function (k) {
          return blockMap.get(k);
        });

        var _firstNode = children.find(function (block) {
          return block.getPrevSiblingKey() == null;
        });

        if (_firstNode == null) {
          process.env.NODE_ENV !== "production" ? warning(true, '%s has no first child', currentKey) : void 0;
          return false;
        }

        currentKey = _firstNode.getKey(); // TODO(T32490138): Deal with multi-node cycles here
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
      process.env.NODE_ENV !== "production" ? warning(true, 'Tree is not connected. %s nodes were seen instead of %s', nodesSeen, blockMap.size) : void 0;
      return false;
    }

    return true;
  },

  /**
   * Checks that the block map is a connected tree with valid blocks
   */
  isValidTree: function isValidTree(blockMap) {
    var _this = this;

    var blocks = blockMap.toArray();

    if (!blocks.every(function (block) {
      return _this.isValidBlock(block, blockMap);
    })) {
      return false;
    }

    return this.isConnectedTree(blockMap);
  }
};
module.exports = DraftTreeInvariants;