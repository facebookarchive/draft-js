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

var UnicodeUtils = require("fbjs/lib/UnicodeUtils");

var findRangesImmutable = require("./findRangesImmutable");

var areEqual = function areEqual(a, b) {
  return a === b;
};

var isTruthy = function isTruthy(a) {
  return !!a;
};

var EMPTY_ARRAY = [];
/**
 * Helper function for getting encoded styles for each inline style. Convert
 * to UTF-8 character counts for storage.
 */

function getEncodedInlinesForType(block, styleList, styleToEncode) {
  var ranges = []; // Obtain an array with ranges for only the specified style.

  var filteredInlines = styleList.map(function (style) {
    return style.has(styleToEncode);
  }).toList();
  findRangesImmutable(filteredInlines, areEqual, // We only want to keep ranges with nonzero style values.
  isTruthy, function (start, end) {
    var text = block.getText();
    ranges.push({
      offset: UnicodeUtils.strlen(text.slice(0, start)),
      length: UnicodeUtils.strlen(text.slice(start, end)),
      style: styleToEncode
    });
  });
  return ranges;
}
/*
 * Retrieve the encoded arrays of inline styles, with each individual style
 * treated separately.
 */


function encodeInlineStyleRanges(block) {
  var styleList = block.getCharacterList().map(function (c) {
    return c.getStyle();
  }).toList();
  var ranges = styleList.flatten().toSet().map(function (style) {
    return getEncodedInlinesForType(block, styleList, style);
  });
  return Array.prototype.concat.apply(EMPTY_ARRAY, ranges.toJS());
}

module.exports = encodeInlineStyleRanges;