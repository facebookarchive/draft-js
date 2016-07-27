/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromDraftStateToRaw
 * 
 */

'use strict';

var DraftEntity = require('./DraftEntity');
var DraftStringKey = require('./DraftStringKey');

var encodeEntityRanges = require('./encodeEntityRanges');
var encodeInlineStyleRanges = require('./encodeInlineStyleRanges');

function convertFromDraftStateToRaw(contentState) {
  var entityStorageKey = 0;
  var entityStorageMap = {};
  var rawBlocks = [];

  contentState.getBlockMap().forEach(function (block, blockKey) {
    block.findEntityRanges(function (character) {
      return character.getEntity() !== null;
    }, function (start) {
      // Stringify to maintain order of otherwise numeric keys.
      var stringifiedEntityKey = DraftStringKey.stringify(block.getEntityAt(start));
      if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
        entityStorageMap[stringifiedEntityKey] = '' + entityStorageKey++;
      }
    });

    rawBlocks.push({
      key: blockKey,
      text: block.getText(),
      type: block.getType(),
      depth: canHaveDepth(block) ? block.getDepth() : 0,
      inlineStyleRanges: encodeInlineStyleRanges(block),
      entityRanges: encodeEntityRanges(block, entityStorageMap),
      data: block.getData().toObject()
    });
  });

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach(function (key, jj) {
    var entity = DraftEntity.get(DraftStringKey.unstringify(key));
    flippedStorageMap[jj] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData()
    };
  });

  return {
    entityMap: flippedStorageMap,
    blocks: rawBlocks
  };
}

function canHaveDepth(block) {
  var type = block.getType();
  return type === 'ordered-list-item' || type === 'unordered-list-item';
}

module.exports = convertFromDraftStateToRaw;