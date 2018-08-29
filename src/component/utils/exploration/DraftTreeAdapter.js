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

import type {RawDraftContentBlock} from 'RawDraftContentBlock';
import type {RawDraftContentState} from 'RawDraftContentState';

const generateRandomKey = require('generateRandomKey');
const invariant = require('invariant');

const traverseInDepthOrder = (
  blocks: Array<RawDraftContentBlock>,
  fn: (block: RawDraftContentBlock) => void,
) => {
  let stack = [...blocks].reverse();
  while (stack.length) {
    const block = stack.pop();

    fn(block);

    const children = block.children;

    invariant(Array.isArray(children), 'Invalid tree raw block');

    stack = stack.concat([...children.reverse()]);
  }
};

const isListBlock = (block?: RawDraftContentBlock): boolean => {
  if (!(block && block.type)) {
    return false;
  }
  const {type} = block;
  return type === 'unordered-list-item' || type === 'ordered-list-item';
};

const addDepthToChildren = (block: RawDraftContentBlock) => {
  if (Array.isArray(block.children)) {
    block.children = block.children.map(
      child =>
        child.type === block.type
          ? {...child, depth: (block.depth || 0) + 1}
          : child,
    );
  }
};

/**
 * This adapter is intended to be be used as an adapter to draft tree data
 *
 * draft state <=====> draft tree state
 */
const DraftTreeAdapter = {
  /**
   * Converts from a tree raw state back to draft raw state
   */
  fromRawTreeStateToRawState(
    draftTreeState: RawDraftContentState,
  ): RawDraftContentState {
    const {blocks} = draftTreeState;
    const transformedBlocks = [];

    invariant(Array.isArray(blocks), 'Invalid raw state');

    if (!Array.isArray(blocks) || !blocks.length) {
      return draftTreeState;
    }

    traverseInDepthOrder(blocks, block => {
      const newBlock = {
        ...block,
      };

      if (isListBlock(block)) {
        newBlock.depth = newBlock.depth || 0;
        addDepthToChildren(block);
      }

      delete newBlock.children;

      transformedBlocks.push(newBlock);
    });

    draftTreeState.blocks = transformedBlocks;

    return {
      ...draftTreeState,
      blocks: transformedBlocks,
    };
  },

  /**
   * Converts from draft raw state to tree draft state
   */
  fromRawStateToRawTreeState(
    draftState: RawDraftContentState,
  ): RawDraftContentState {
    let lastListDepthCacheRef = {};
    const transformedBlocks = [];

    draftState.blocks.forEach(block => {
      const isList = isListBlock(block);
      const depth = block.depth || 0;
      const treeBlock = {
        ...block,
        children: [],
      };

      if (!isList) {
        // reset the cache path
        lastListDepthCacheRef = {};
        transformedBlocks.push(treeBlock);
        return;
      }

      // nesting
      if (depth > 0) {
        let parent = lastListDepthCacheRef[depth - 1];
        if (parent == null) {
          parent = {
            key: generateRandomKey(),
            text: '',
            depth: depth - 1,
            type: block.type,
            children: [],
            entityRanges: [],
            inlineStyleRanges: [],
          };

          lastListDepthCacheRef[depth - 1] = parent;
          if (depth === 1) {
            // add as a root-level block
            transformedBlocks.push(parent);
          } else {
            // depth > 1 => also add as previous parent's child
            const grandparent = lastListDepthCacheRef[depth - 2];
            grandparent.children.push(parent);
          }
        }

        invariant(parent, 'Invalid depth for RawDraftContentBlock');

        // push nested list blocks
        parent.children.push(treeBlock);
        return;
      }

      // push root list blocks
      transformedBlocks.push(treeBlock);
    });

    return {
      ...draftState,
      blocks: transformedBlocks,
    };
  },
};

module.exports = DraftTreeAdapter;
