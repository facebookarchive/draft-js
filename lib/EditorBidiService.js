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

var UnicodeBidiService = require("fbjs/lib/UnicodeBidiService");

var Immutable = require("immutable");

var nullthrows = require("fbjs/lib/nullthrows");

var OrderedMap = Immutable.OrderedMap;
var bidiService;
var EditorBidiService = {
  getDirectionMap: function getDirectionMap(content, prevBidiMap) {
    if (!bidiService) {
      bidiService = new UnicodeBidiService();
    } else {
      bidiService.reset();
    }

    var blockMap = content.getBlockMap();
    var nextBidi = blockMap.valueSeq().map(function (block) {
      return nullthrows(bidiService).getDirection(block.getText());
    });
    var bidiMap = OrderedMap(blockMap.keySeq().zip(nextBidi));

    if (prevBidiMap != null && Immutable.is(prevBidiMap, bidiMap)) {
      return prevBidiMap;
    }

    return bidiMap;
  }
};
module.exports = EditorBidiService;