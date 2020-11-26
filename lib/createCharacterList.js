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

var Immutable = require("immutable");

var List = Immutable.List;

function createCharacterList(inlineStyles, entities) {
  var characterArray = inlineStyles.map(function (style, ii) {
    var entity = entities[ii];
    return CharacterMetadata.create({
      style: style,
      entity: entity
    });
  });
  return List(characterArray);
}

module.exports = createCharacterList;