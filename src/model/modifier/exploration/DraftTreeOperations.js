/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
import type {BlockMap} from 'BlockMap';

const invariant = require('invariant');

const DraftTreeOperations = {
  /**
   * This is a utility method for setting B as a first/last child of A, ensuring
   * that parent <-> child operations are correctly mirrored
   *
   * The block map returned by this method may not be a valid tree (siblings are
   * unaffected)
   */
  updateParentChild(
    blockMap: BlockMap,
    parentKey: string,
    childKey: string,
    position: 'first' | 'last',
  ): BlockMap {
    const parent = blockMap.get(parentKey);
    const child = blockMap.get(childKey);
    invariant(
      parent != null && child != null,
      'parent & child should exist in the block map',
    );
    const existingChildren = parent.getChildKeys();
    const newBlocks = {};
    // add as parent's child
    newBlocks[parentKey] = parent.merge({
      children:
        position === 'first'
          ? existingChildren.unshift(childKey)
          : existingChildren.push(childKey),
    });
    // add as child's parent
    if (existingChildren.count() !== 0) {
      // link child as sibling to the existing children
      switch (position) {
        case 'first':
          const nextSiblingKey = existingChildren.first();
          newBlocks[childKey] = child.merge({
            parent: parentKey,
            nextSibling: nextSiblingKey,
            prevSibling: null,
          });
          newBlocks[nextSiblingKey] = blockMap.get(nextSiblingKey).merge({
            prevSibling: childKey,
          });
          break;
        case 'last':
          const prevSiblingKey = existingChildren.last();
          newBlocks[childKey] = child.merge({
            parent: parentKey,
            prevSibling: prevSiblingKey,
            nextSibling: null,
          });
          newBlocks[prevSiblingKey] = blockMap.get(prevSiblingKey).merge({
            nextSibling: childKey,
          });
          break;
      }
    } else {
      newBlocks[childKey] = child.merge({
        parent: parentKey,
        prevSibling: null,
        nextSibling: null,
      });
    }
    return blockMap.merge(newBlocks);
  },

  /**
   * This is a utility method for setting B as the next sibling of A, ensuring
   * that sibling operations are correctly mirrored
   *
   * The block map returned by this method may not be a valid tree (parent/child/
   * other siblings are unaffected)
   */
  updateSibling(
    blockMap: BlockMap,
    prevKey: string,
    nextKey: string,
  ): BlockMap {
    const prevSibling = blockMap.get(prevKey);
    const nextSibling = blockMap.get(nextKey);
    invariant(
      prevSibling != null && nextSibling != null,
      'siblings should exist in the block map',
    );
    const newBlocks = {};
    newBlocks[prevKey] = prevSibling.merge({
      nextSibling: nextKey,
    });
    newBlocks[nextKey] = nextSibling.merge({
      prevSibling: prevKey,
    });
    return blockMap.merge(newBlocks);
  },
};

module.exports = DraftTreeOperations;
