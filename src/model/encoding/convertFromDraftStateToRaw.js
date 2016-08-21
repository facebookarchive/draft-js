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

var DraftStringKey = require('DraftStringKey');

var encodeEntityRanges = require('encodeEntityRanges');
var encodeInlineStyleRanges = require('encodeInlineStyleRanges');

import type ContentState from 'ContentState';
import type {RawDraftContentState} from 'RawDraftContentState';

function convertFromDraftStateToRaw(
  contentState: ContentState
): RawDraftContentState {
  var entityStorageKey = 0;
  var entityStorageMap = {};
  var rawBlocks = [];

  contentState.getBlockMap().forEach((block, blockKey) => {
    block.findEntityRanges(
      character => character.getEntity() !== null,
      start => {
        // Stringify to maintain order of otherwise numeric keys.
        var stringifiedEntityKey = DraftStringKey.stringify(
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
      depth: block.getDepth(),
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block, entityStorageMap),
      data: block.getData().toObject(),
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {
    var entity = contentState.getEntity(DraftStringKey.unstringify(key));
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

module.exports = convertFromDraftStateToRaw;
