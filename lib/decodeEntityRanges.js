/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule decodeEntityRanges
 * @typechecks
 * 
 */

'use strict';

var UnicodeUtils = require('fbjs/lib/UnicodeUtils');

var substr = UnicodeUtils.substr;

/**
 * Convert to native JavaScript string lengths to determine ranges.
 */

function decodeEntityRanges(text, ranges) {
  var entities = Array(text.length).fill(null);
  if (ranges) {
    ranges.forEach(function (range) {
      // Using Unicode-enabled substrings converted to JavaScript lengths,
      // fill the output array with entity keys.
      var start = substr(text, 0, range.offset).length;
      var end = start + substr(text, range.offset, range.length).length;
      for (var ii = start; ii < end; ii++) {
        entities[ii] = range.key;
      }
    });
  }
  return entities;
}

module.exports = decodeEntityRanges;