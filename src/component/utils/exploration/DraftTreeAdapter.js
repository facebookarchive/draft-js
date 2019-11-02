/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
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

        // if it's a non-leaf node, we don't do anything else
        if (block.children != null && block.children.length > 0) {
          return;
        }
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
    const transformedBlocks = [];
    const parentStack = [];

    draftState.blocks.forEach(block => {
      const isList = isListBlock(block);
      const depth = block.depth || 0;
      const treeBlock = {
        ...block,
        children: [],
      };

      if (!isList) {
        transformedBlocks.push(treeBlock);
        return;
      }

      let lastParent = parentStack[0];
      // block is non-nested & there are no nested blocks, directly push block
      if (lastParent == null && depth === 0) {
        transformedBlocks.push(treeBlock);
        // block is first nested block or previous nested block is at a lower level
      } else if (lastParent == null || lastParent.depth < depth - 1) {
        // create new parent block
        const newParent = {
          key: generateRandomKey(),
          text: '',
          depth: depth - 1,
          type: block.type,
          children: [],
          entityRanges: [],
          inlineStyleRanges: [],
        };

        parentStack.unshift(newParent);
        if (depth === 1) {
          // add as a root-level block
          transformedBlocks.push(newParent);
        } else if (lastParent != null) {
          // depth > 1 => also add as previous parent's child
          lastParent.children.push(newParent);
        }
        newParent.children.push(treeBlock);
      } else if (lastParent.depth === depth - 1) {
        // add as child of last parent
        lastParent.children.push(treeBlock);
      } else {
        // pop out parents at levels above this one from the parent stack
        while (lastParent != null && lastParent.depth >= depth) {
          parentStack.shift();
          lastParent = parentStack[0];
        }
        if (depth > 0) {
          lastParent.children.push(treeBlock);
        } else {
          transformedBlocks.push(treeBlock);
        }
      }
    });

    return {
      ...draftState,
      blocks: transformedBlocks,
    };
  },
};

module.exports = DraftTreeAdapter;
