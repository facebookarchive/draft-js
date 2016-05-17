/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EditorBidiService
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');
var UnicodeBidiService = require('UnicodeBidiService');

var nullthrows = require('nullthrows');

import type ContentState from 'ContentState';

var {OrderedMap} = Immutable;

var bidiService;

var EditorBidiService = {
  getDirectionMap: function(
    content: ContentState,
    prevBidiMap: ?OrderedMap,
    prevContent: ?ContentState,
  ): OrderedMap {
    if (content === prevContent) {
      return prevBidiMap;
    }

    if (!bidiService) {
      bidiService = new UnicodeBidiService();
    } else {
      bidiService.reset();
    }

    var newBlockMap = content.getBlockMap();

    if (!prevBidiMap || !prevContent) {
      var nextBidi = newBlockMap
        .valueSeq()
        .map(block => nullthrows(bidiService).getDirection(block.getText()));

      return OrderedMap(newBlockMap.keySeq().zip(nextBidi));
    } else {
      // only update direction for blocks that have changed, then continue looking until we find an unchanged direction.

      var prevLineChanged = false;
      var prevBlockMap = prevContent.getBlockMap();

      var hasChanged = false;

      var newBidiMap = newBlockMap
        .map((block, key) => {
          if (prevLineChanged || block != prevBlockMap.get(key)) {
            var newDirection = nullthrows(bidiService).getDirection(block.getText());
            var oldDirection = prevBidiMap.get(key);
            if (newDirection !== oldDirection) {
              prevLineChanged = true;
              hasChanged = true;
            }
            return newDirection;
          } else {
            return prevBidiMap.get(key);
          }
        });

      return hasChanged ? newBidiMap : prevBidiMap; 
    }
  },
};

module.exports = EditorBidiService;
