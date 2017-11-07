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

const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const invariant = require('invariant');

const createRawBlock = (block, entityStorageMap) => {
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

const insertRawBlock = (block, entityMap, rawBlocks, blockCacheRef) => {
  if (block instanceof ContentBlock) {
    rawBlocks.push(createRawBlock(block, entityMap));
    return;
  }

  invariant(block instanceof ContentBlockNode, 'block is not a BlockNode');

  const parentKey = block.getParentKey();
  const rawBlock = (blockCacheRef[block.getKey()] = {
    ...createRawBlock(block, entityMap),
    children: [],
  });

  if (parentKey) {
    blockCacheRef[parentKey].children.push(rawBlock);
    return;
  }

  rawBlocks.push(rawBlock);
};

const insertRawEntity = (
  entityStorageKey,
  entityKey,
  entityMap,
  entityCacheRef,
) => {
  // Stringify to maintain order of otherwise numeric keys.
  const stringifiedEntityKey = DraftStringKey.stringify(entityKey);

  if (entityCacheRef[stringifiedEntityKey]) {
    return;
  }

  entityCacheRef[stringifiedEntityKey] = entityKey;

  // we need the `any` casting here since this is a temporary state
  // where we will later on flip the entity map and populate it with
  // real entity, at this stage we just need to map back the entity
  // key used by the BlockNode
  entityMap[stringifiedEntityKey] = (`${entityStorageKey}`: any);
};

const encodeRawBlocks = (
  contentState: ContentState,
  rawState: RawDraftContentState,
): RawDraftContentState => {
  const {entityMap} = rawState;

  const rawBlocks = [];

  const blockCacheRef = {};
  const entityCacheRef = {};
  let entityStorageKey = 0;

  contentState.getBlockMap().forEach(block => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start =>
        insertRawEntity(
          entityStorageKey++,
          block.getEntityAt(start),
          entityMap,
          entityCacheRef,
        ),
    );

    insertRawBlock(block, entityMap, rawBlocks, blockCacheRef);
  });

  return {
    blocks: rawBlocks,
    entityMap,
  };
};

// Flip storage map so that our storage keys map to global
// DraftEntity keys.
const encodeRawEntityMap = (
  contentState: ContentState,
  rawState: RawDraftContentState,
): RawDraftContentState => {
  const {blocks, entityMap} = rawState;

  const rawEntityMap = {};

  Object.keys(entityMap).forEach((key, index) => {
    const entity = contentState.getEntity(DraftStringKey.unstringify(key));
    rawEntityMap[index] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData(),
    };
  });

  return {
    blocks,
    entityMap: rawEntityMap,
  };
};

const convertFromDraftStateToRaw = (
  contentState: ContentState,
): RawDraftContentState => {
  let rawDraftContentState = {
    entityMap: {},
    blocks: [],
  };

  // add blocks
  rawDraftContentState = encodeRawBlocks(contentState, rawDraftContentState);

  // add entities
  rawDraftContentState = encodeRawEntityMap(contentState, rawDraftContentState);

  return rawDraftContentState;
};

module.exports = convertFromDraftStateToRaw;
