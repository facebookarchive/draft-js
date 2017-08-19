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

import type ContentState from 'ContentState';
import type {RawDraftContentState} from 'RawDraftContentState';

var encodeEntityRanges = require('encodeEntityRanges');
var encodeInlineStyleRanges = require('encodeInlineStyleRanges');

function convertFromDraftStateToRaw(
  contentState: ContentState,
): RawDraftContentState {
  var entityStorageMap = {};
  var rawBlocks = [];

  contentState.getBlockMap().forEach((block, blockKey) => {
    block.findEntityRanges(
      character => character.getEntity().size > 0,
      start => {
        block.getEntityAt(start).forEach(k => {
          if (!entityStorageMap.hasOwnProperty(k)) {
            entityStorageMap[k] = true;
          }
        });
      },
    );

    rawBlocks.push({
      key: blockKey,
      text: block.getText(),
      type: block.getType(),
      depth: block.getDepth(),
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block),
      data: block.getData().toObject(),
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach(key => {
    var entity = contentState.getEntity(key);
    flippedStorageMap[key] = {
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

module.exports = convertFromDraftStateToRaw;
