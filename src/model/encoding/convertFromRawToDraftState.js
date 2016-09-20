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
var DraftEntityInstance = require('DraftEntityInstance');

const addEntityToEntityMap = require('addEntityToEntityMap');
var createCharacterList = require('createCharacterList');
var decodeEntityRanges = require('decodeEntityRanges');
var decodeInlineStyleRanges = require('decodeInlineStyleRanges');
var generateRandomKey = require('generateRandomKey');
var Immutable = require('immutable');
var {OrderedMap} = Immutable;

import type {RawDraftContentState} from 'RawDraftContentState';

var {Map} = Immutable;

function convertFromRawToDraftState(
  rawState: RawDraftContentState
): ContentState {
  var {blocks, entityMap} = rawState;

  var fromStorageToLocal = {};

  const newEntityMap = Object.keys(entityMap).reduce(
    (updatedEntityMap, storageKey) => {
      var encodedEntity = entityMap[storageKey];
      var {type, mutability, data} = encodedEntity;
      const instance = new DraftEntityInstance({type, mutability, data: data || {}});
      const tempEntityMap = addEntityToEntityMap(updatedEntityMap, instance);
      const newKey = tempEntityMap.keySeq().last();
      fromStorageToLocal[storageKey] = newKey;
      return tempEntityMap;
    },
    OrderedMap()
  );

  var contentBlocks = blocks.map(
    block => {
      var {
        key,
        type,
        text,
        depth,
        inlineStyleRanges,
        entityRanges,
        data,
      } = block;
      key = key || generateRandomKey();
      depth = depth || 0;
      inlineStyleRanges = inlineStyleRanges || [];
      entityRanges = entityRanges || [];
      data = Map(data);

      var inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

      // Translate entity range keys to the DraftEntity map.
      var filteredEntityRanges = entityRanges
        .filter(range => fromStorageToLocal.hasOwnProperty(range.key))
        .map(range => {
          return {...range, key: fromStorageToLocal[range.key]};
        });

      var entities = decodeEntityRanges(text, filteredEntityRanges);
      var characterList = createCharacterList(inlineStyles, entities);

      return new ContentBlock({key, type, text, depth, characterList, data});
    }
  );

  return ContentState.createFromBlockArray(contentBlocks, newEntityMap);
}

module.exports = convertFromRawToDraftState;
