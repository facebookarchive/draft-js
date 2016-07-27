/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromRawToDraftState
 * 
 */

'use strict';

var _assign = require('object-assign');

var _extends = _assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ContentBlock = require('./ContentBlock');
var ContentState = require('./ContentState');
var DraftEntity = require('./DraftEntity');
var Immutable = require('immutable');

var createCharacterList = require('./createCharacterList');
var decodeEntityRanges = require('./decodeEntityRanges');
var decodeInlineStyleRanges = require('./decodeInlineStyleRanges');
var generateRandomKey = require('./generateRandomKey');

var Map = Immutable.Map;


function convertFromRawToDraftState(rawState) {
  var blocks = rawState.blocks;
  var entityMap = rawState.entityMap;


  var fromStorageToLocal = {};
  Object.keys(entityMap).forEach(function (storageKey) {
    var encodedEntity = entityMap[storageKey];
    var type = encodedEntity.type;
    var mutability = encodedEntity.mutability;
    var data = encodedEntity.data;

    var newKey = DraftEntity.create(type, mutability, data || {});
    fromStorageToLocal[storageKey] = newKey;
  });

  var contentBlocks = blocks.map(function (block) {
    var key = block.key;
    var type = block.type;
    var text = block.text;
    var depth = block.depth;
    var inlineStyleRanges = block.inlineStyleRanges;
    var entityRanges = block.entityRanges;
    var data = block.data;

    key = key || generateRandomKey();
    depth = depth || 0;
    inlineStyleRanges = inlineStyleRanges || [];
    entityRanges = entityRanges || [];
    data = Map(data);

    var inlineStyles = decodeInlineStyleRanges(text, inlineStyleRanges);

    // Translate entity range keys to the DraftEntity map.
    var filteredEntityRanges = entityRanges.filter(function (range) {
      return fromStorageToLocal.hasOwnProperty(range.key);
    }).map(function (range) {
      return _extends({}, range, { key: fromStorageToLocal[range.key] });
    });

    var entities = decodeEntityRanges(text, filteredEntityRanges);
    var characterList = createCharacterList(inlineStyles, entities);

    return new ContentBlock({ key: key, type: type, text: text, depth: depth, characterList: characterList, data: data });
  });

  return ContentState.createFromBlockArray(contentBlocks);
}

module.exports = convertFromRawToDraftState;