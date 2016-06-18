/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromRawToDraftState
 * @flow
 */

'use strict';

var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');
var DraftEntity = require('DraftEntity');

var DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');
var createCharacterList = require('createCharacterList');
var decodeEntityRanges = require('decodeEntityRanges');
var decodeInlineStyleRanges = require('decodeInlineStyleRanges');
var generateRandomKey = require('generateRandomKey');
const generateNestedKey = require('generateNestedKey');

import type {RawDraftContentState} from 'RawDraftContentState';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {RawDraftContentBlock} from 'RawDraftContentBlock';

function convertBlocksFromRaw(
  inputBlocks: Array<RawDraftContentBlock>,
  fromStorageToLocal: Object,
  blockRenderMap: DraftBlockRenderMap,
  parentKey: ?string,
  parentBlock: ?Object,
) : Array<ContentBlock> {
  return inputBlocks.reduce(
    (result, block) => {
      var {
        key,
        type,
        text,
        depth,
        inlineStyleRanges,
        entityRanges,
        blocks
      } = block;

      var parentBlockRenderingConfig = parentBlock ?
        blockRenderMap.get(parentBlock.type) :
        null;

      key = key || generateRandomKey();
      depth = depth || 0;
      inlineStyleRanges = inlineStyleRanges || [];
      entityRanges = entityRanges || [];
      blocks = blocks || [];

      key = parentKey && parentBlockRenderingConfig &&
        parentBlockRenderingConfig.nestingEnabled ?
          generateNestedKey(parentKey, key) :
          key;

      var inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

      // Translate entity range keys to the DraftEntity map.
      var filteredEntityRanges = entityRanges
        .filter(range => fromStorageToLocal.hasOwnProperty(range.key))
        .map(range => {
          return {...range, key: fromStorageToLocal[range.key]};
        });

      var entities = decodeEntityRanges(text, filteredEntityRanges);
      var characterList = createCharacterList(inlineStyles, entities);

      // Push parent block first
      result.push(new ContentBlock({key, type, text, depth, characterList}));

      // Then push child blocks
      result = result.concat(
        convertBlocksFromRaw(
          blocks,
          fromStorageToLocal,
          blockRenderMap,
          key,
          block
        )
      );

      return result;
    }, []
  );
}

function convertFromRawToDraftState(
  rawState: RawDraftContentState,
  blockRenderMap:DraftBlockRenderMap=DefaultDraftBlockRenderMap
): ContentState {
  var {blocks, entityMap} = rawState;

  var fromStorageToLocal = {};
  Object.keys(entityMap).forEach(
    storageKey => {
      var encodedEntity = entityMap[storageKey];
      var {type, mutability, data} = encodedEntity;
      var newKey = DraftEntity.create(type, mutability, data || {});
      fromStorageToLocal[storageKey] = newKey;
    }
  );

  var contentBlocks = convertBlocksFromRaw(blocks, fromStorageToLocal, blockRenderMap);
  return ContentState.createFromBlockArray(contentBlocks);
}

module.exports = convertFromRawToDraftState;
