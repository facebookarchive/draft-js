/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule decodeEntityRanges
 * @format
 * @flow
 */

'use strict';

var {OrderedSet} = require('immutable');
var UnicodeUtils = require('UnicodeUtils');

var {substr} = UnicodeUtils;

import type {DraftEntitySet} from 'DraftEntitySet';

const EMPTY_SET = OrderedSet();

/**
 * Convert to native JavaScript string lengths to determine ranges.
 */
function decodeEntityRanges(
  text: string,
  ranges?: Array<Object>,
): Array<DraftEntitySet> {
  var entities = Array(text.length).fill(EMPTY_SET);
  if (ranges) {
    ranges.forEach((/*object*/ range) => {
      var cursor = substr(text, 0, range.offset).length;
      var end = cursor + substr(text, range.offset, range.length).length;
      while (cursor < end) {
        entities[cursor] = entities[cursor].add(range.key);
        cursor++;
      }
    });
  }
  return entities;
}

module.exports = decodeEntityRanges;
