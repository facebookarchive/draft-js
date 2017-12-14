/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule randomizeBlockMapKeys
 * @format
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';

const ContentBlockNode = require('ContentBlockNode');
const Immutable = require('immutable');

const generateRandomKey = require('generateRandomKey');

const {OrderedMap} = Immutable;

const randomizeContentBlockNodeKeys = (blockMap: BlockMap): BlockMap => {
  const newKeys = [];
  return OrderedMap(
    blockMap
      .withMutations(blockMapState => {
        blockMapState.forEach((block, index) => {
          const oldKey = block.getKey();
          const nextKey = block.getNextSiblingKey();
          const prevKey = block.getPrevSiblingKey();
          const childrenKeys = block.getChildKeys();
          const parentKey = block.getParentKey();

          // new key that we will use to build linking
          const key = generateRandomKey();

          // we will add it here to re-use it later
          newKeys.push(key);

          if (nextKey) {
            const nextBlock = blockMapState.get(nextKey);
            if (nextBlock) {
              blockMapState.mergeIn(
                nextKey,
                nextBlock.merge({
                  prevSibling: key,
                }),
              );
            } else {
              // this can happen when generating random keys for fragments
              blockMapState.mergeIn(
                oldKey,
                block.merge({
                  nextSibling: null,
                }),
              );
            }
          }

          if (prevKey) {
            const prevBlock = blockMapState.get(prevKey);
            if (prevBlock) {
              blockMapState.mergeIn(
                prevKey,
                prevBlock.merge({
                  nextSibling: key,
                }),
              );
            } else {
              // this can happen when generating random keys for fragments
              blockMapState.mergeIn(
                oldKey,
                block.merge({
                  prevSibling: null,
                }),
              );
            }
          }

          if (parentKey) {
            const parentBlock = blockMapState.get(parentKey);
            if (parentBlock) {
              const parentChildrenList = parentBlock.getChildKeys();
              blockMapState.setIn(
                parentKey,
                parentBlock.merge({
                  children: parentChildrenList.set(
                    parentChildrenList.indexOf(block.getKey()),
                    key,
                  ),
                }),
              );
            } else {
              blockMapState.mergeIn(
                oldKey,
                block.merge({
                  parent: null,
                }),
              );
            }
          }

          childrenKeys.forEach(childKey => {
            const childBlock = blockMapState.get(childKey);
            if (childBlock) {
              blockMapState.mergeIn(
                childKey,
                childBlock.merge({
                  parent: key,
                }),
              );
            } else {
              blockMapState.mergeIn(
                oldKey,
                block.merge({
                  children: block
                    .getChildKeys()
                    .filter(child => child !== childKey),
                }),
              );
            }
          });
        });
      })
      .toArray()
      .map((block, index) => [
        newKeys[index],
        block.set('key', newKeys[index]),
      ]),
  );
};

const randomizeContentBlockKeys = (blockMap: BlockMap): BlockMap => {
  return OrderedMap(
    blockMap.toArray().map(block => {
      const key = generateRandomKey();
      return [key, block.set('key', key)];
    }),
  );
};

const randomizeBlockMapKeys = (blockMap: BlockMap): BlockMap => {
  const isTreeBasedBlockMap = blockMap.first() instanceof ContentBlockNode;

  if (!isTreeBasedBlockMap) {
    return randomizeContentBlockKeys(blockMap);
  }

  return randomizeContentBlockNodeKeys(blockMap);
};

module.exports = randomizeBlockMapKeys;
