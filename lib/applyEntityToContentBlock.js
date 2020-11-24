/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var CharacterMetadata = require("./CharacterMetadata");

function applyEntityToContentBlock(contentBlock, startArg, end, entityKey) {
  var start = startArg;
  var characterList = contentBlock.getCharacterList();

  while (start < end) {
    characterList = characterList.set(start, CharacterMetadata.applyEntity(characterList.get(start), entityKey));
    start++;
  }

  return contentBlock.set('characterList', characterList);
}

module.exports = applyEntityToContentBlock;