/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';
import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';
import type {RawDraftContentBlock} from 'RawDraftContentBlock';
import type {RawDraftContentState} from 'RawDraftContentState';
import type {RawDraftEntity} from 'RawDraftEntity';

const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const DraftStringKey = require('DraftStringKey');

const encodeEntityRanges = require('encodeEntityRanges');
const encodeInlineStyleRanges = require('encodeInlineStyleRanges');
const invariant = require('invariant');

const createRawBlock = (
  block: BlockNodeRecord,
  entityStorageMap: {[key: string]: RawDraftEntity},
) => {
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

const insertRawBlock = (
  block: BlockNodeRecord,
  entityMap: {[key: string]: RawDraftEntity},
  rawBlocks: Array<RawDraftContentBlock>,
  blockCacheRef: {...},
) => {
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

const encodeRawBlocks = (
  contentState: ContentState,
  rawState: RawDraftContentState,
): RawDraftContentState => {
  const {entityMap} = rawState;

  const rawBlocks = [];

  const blockCacheRef = {};
  const entityCacheRef: {[string]: ?string} = {};
  let entityStorageKey = 0;

  contentState.getBlockMap().forEach(block => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        const entityKey = block.getEntityAt(start);
        // Stringify to maintain order of otherwise numeric keys.
        const stringifiedEntityKey = DraftStringKey.stringify(entityKey);
        // This makes this function resilient to two entities
        // erroneously having the same key
        if (entityCacheRef[stringifiedEntityKey]) {
          return;
        }
        entityCacheRef[stringifiedEntityKey] = entityKey;
        // we need the `any` casting here since this is a temporary state
        // where we will later on flip the entity map and populate it with
        // real entity, at this stage we just need to map back the entity
        // key used by the BlockNode
        entityMap[stringifiedEntityKey] = (`${entityStorageKey}`: any);
        entityStorageKey++;
      },
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

  const rawEntityMap: {
    [number]: {
      data: any,
      mutability: DraftEntityMutability,
      type: DraftEntityType,
    },
  } = {};

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
    // $FlowFixMe[incompatible-exact]
    // $FlowFixMe[incompatible-return]
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
  // $FlowFixMe[prop-missing]
  rawDraftContentState = encodeRawBlocks(contentState, rawDraftContentState);

  // add entities
  // $FlowFixMe[prop-missing]
  rawDraftContentState = encodeRawEntityMap(contentState, rawDraftContentState);

  return rawDraftContentState;
};

module.exports = convertFromDraftStateToRaw;
