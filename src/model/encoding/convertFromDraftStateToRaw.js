/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromDraftStateToRaw
 * @format
 * @flow
 */

'use strict';

import type ContentState from 'ContentState';
import type {RawDraftContentState} from 'RawDraftContentState';

const DraftStringKey = require('DraftStringKey');

const encodeEntityRanges = require('encodeEntityRanges');
const encodeInlineStyleRanges = require('encodeInlineStyleRanges');

const encodeBlock = (block, entityStorageMap) => {
  return {
    key: block.getKey(),
    text: block.getText(),
    type: block.getType(),
    depth: block.getDepth(),
    inlineStyleRanges: encodeInlineStyleRanges(block),
    entityRanges: encodeEntityRanges(block, entityStorageMap),
    data: block.getData().toObject(),
  };
};

const convertFromDraftStateToRaw = (
  contentState: ContentState,
): RawDraftContentState => {
  let entityStorageKey = 0;
  const entityStorageMap = {};
  const rawBlocks = [];

  contentState.getBlockMap().forEach(block => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        // Stringify to maintain order of otherwise numeric keys.
        const stringifiedEntityKey = DraftStringKey.stringify(
          block.getEntityAt(start),
        );
        if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
          entityStorageMap[stringifiedEntityKey] = '' + entityStorageKey++;
        }
      },
    );

    rawBlocks.push(encodeBlock(block, entityStorageMap));
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  const entityKeys = Object.keys(entityStorageMap);
  const flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {
    const entity = contentState.getEntity(DraftStringKey.unstringify(key));
    flippedStorageMap[jj] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData(),
    };
  });

  return {
    entityMap: flippedStorageMap,
    blocks: rawBlocks,
  };
};

module.exports = convertFromDraftStateToRaw;
