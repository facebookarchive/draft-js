/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromDraftStateToRaw
 * @flow
 */

'use strict';

const DraftEntity = require('DraftEntity');
const DraftStringKey = require('DraftStringKey');

const encodeEntityRanges = require('encodeEntityRanges');
const encodeInlineStyleRanges = require('encodeInlineStyleRanges');

import type ContentBlock from 'ContentBlock';
import type ContentState from 'ContentState';
import type {RawDraftContentState} from 'RawDraftContentState';

function convertFromDraftStateToRaw(
  contentState: ContentState
): RawDraftContentState {
  let entityStorageKey = 0;
  const entityStorageMap = {};
  const rawBlocks = [];

  contentState.getBlockMap().forEach((block, blockKey) => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        // Stringify to maintain order of otherwise numeric keys.
        const stringifiedEntityKey = DraftStringKey.stringify(
          block.getEntityAt(start)
        );
        if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
          entityStorageMap[stringifiedEntityKey] = '' + (entityStorageKey++);
        }
      }
    );

    rawBlocks.push({
      key: blockKey,
      text: block.getText(),
      type: block.getType(),
      depth: canHaveDepth(block) ? block.getDepth() : 0,
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block, entityStorageMap),
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  const entityKeys = Object.keys(entityStorageMap);
  const flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {
    const entity = DraftEntity.get(DraftStringKey.unstringify(key));
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
}

function canHaveDepth(block: ContentBlock): boolean {
  const type = block.getType();
  return type === 'ordered-list-item' || type === 'unordered-list-item';
}

module.exports = convertFromDraftStateToRaw;
