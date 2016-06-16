/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule randomizeBlockMapKeys
 * @typechecks
 * @flow
 */

'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const ContentBlock = require('ContentBlock');
const generateNestedKey = require('generateNestedKey');
const generateRandomKey = require('generateRandomKey');

import type {BlockMap} from 'BlockMap';

/*
 * Returns a new randomized keys blockmap that will
 * also respect nesting keys rules
 */
function randomizeBlockMapKeys(
  blockMap: BlockMap
): BlockMap {
  let newKeyHashMap = {};
  const contentBlocks = (
    blockMap
    .map((block, blockKey) => {
      const parentKey = block.getParentKey();

      const newKey = newKeyHashMap[blockKey] = (
        parentKey ?
          newKeyHashMap[parentKey] ? // we could be inserting just a fragment
            generateNestedKey(newKeyHashMap[parentKey]) :
            generateNestedKey(parentKey) :
          generateRandomKey()
      );

      return new ContentBlock({
        key: newKey,
        type: block.getType(),
        depth: block.getDepth(),
        text: block.getText(),
        characterList: block.getCharacterList()
      });
    })
    .toArray()
  );

  return BlockMapBuilder.createFromArray(contentBlocks);
}

module.exports = randomizeBlockMapKeys;
