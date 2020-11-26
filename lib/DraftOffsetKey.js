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

var KEY_DELIMITER = '-';
var DraftOffsetKey = {
  encode: function encode(blockKey, decoratorKey, leafKey) {
    return blockKey + KEY_DELIMITER + decoratorKey + KEY_DELIMITER + leafKey;
  },
  decode: function decode(offsetKey) {
    // Extracts the last two parts of offsetKey and captures the rest in blockKeyParts
    var _offsetKey$split$reve = offsetKey.split(KEY_DELIMITER).reverse(),
        leafKey = _offsetKey$split$reve[0],
        decoratorKey = _offsetKey$split$reve[1],
        blockKeyParts = _offsetKey$split$reve.slice(2);

    return {
      // Recomposes the parts of blockKey after reversing them
      blockKey: blockKeyParts.reverse().join(KEY_DELIMITER),
      decoratorKey: parseInt(decoratorKey, 10),
      leafKey: parseInt(leafKey, 10)
    };
  }
};
module.exports = DraftOffsetKey;