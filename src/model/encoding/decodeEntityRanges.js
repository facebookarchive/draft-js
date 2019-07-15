/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

const UnicodeUtils = require('UnicodeUtils');

const {substr} = UnicodeUtils;

/**
 * Convert to native JavaScript string lengths to determine ranges.
 */
function decodeEntityRanges(
  text: string,
  ranges: Array<Object>,
): Array<?string> {
  const entities = Array(text.length).fill(null);
  if (ranges) {
    ranges.forEach(range => {
      // Using Unicode-enabled substrings converted to JavaScript lengths,
      // fill the output array with entity keys.
      const start = substr(text, 0, range.offset).length;
      const end = start + substr(text, range.offset, range.length).length;
      for (let ii = start; ii < end; ii++) {
        entities[ii] = range.key;
      }
    });
  }
  return entities;
}

module.exports = decodeEntityRanges;
