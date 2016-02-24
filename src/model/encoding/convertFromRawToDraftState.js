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

const ContentBlock = require('ContentBlock');
const DraftEntity = require('DraftEntity');

const createCharacterList = require('createCharacterList');
const decodeEntityRanges = require('decodeEntityRanges');
const decodeInlineStyleRanges = require('decodeInlineStyleRanges');
const generateBlockKey = require('generateBlockKey');

import type {RawDraftContentState} from 'RawDraftContentState';

function convertFromRawToDraftState(
  rawState: RawDraftContentState
): Array<ContentBlock> {
  const {blocks, entityMap} = rawState;

  const fromStorageToLocal = {};
  Object.keys(entityMap).forEach(
    storageKey => {
      const encodedEntity = entityMap[storageKey];
      const {type, mutability, data} = encodedEntity;
      const newKey = DraftEntity.create(type, mutability, data || {});
      fromStorageToLocal[storageKey] = newKey;
    }
  );

  return blocks.map(
    block => {
      const {type, text} = block
      let {key, depth, inlineStyleRanges, entityRanges} = block;
      key = key || generateBlockKey();
      depth = depth || 0;
      inlineStyleRanges = inlineStyleRanges || [];
      entityRanges = entityRanges || [];

      const inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

      // Translate entity range keys to the DraftEntity map.
      const filteredEntityRanges = entityRanges
        .filter(range => fromStorageToLocal.hasOwnProperty(range.key))
        .map(range => {
          return {...range, key: fromStorageToLocal[range.key]};
        });

      const entities = decodeEntityRanges(text, filteredEntityRanges);
      const characterList = createCharacterList(inlineStyles, entities);

      return new ContentBlock({key, type, text, depth, characterList});
    }
  );
}

module.exports = convertFromRawToDraftState;
