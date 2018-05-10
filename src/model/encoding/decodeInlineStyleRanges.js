/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

const {OrderedSet} = require('immutable');
const UnicodeUtils = require('UnicodeUtils');

const {substr} = UnicodeUtils;

import type {DraftInlineStyle} from 'DraftInlineStyle';

const EMPTY_SET = OrderedSet();

/**
 * Convert to native JavaScript string lengths to determine ranges.
 */
function decodeInlineStyleRanges(
  text: string,
  ranges?: Array<Object>,
): Array<DraftInlineStyle> {
  const styles = Array(text.length).fill(EMPTY_SET);
  if (ranges) {
    ranges.forEach((/*object*/ range) => {
      let cursor = substr(text, 0, range.offset).length;
      const end = cursor + substr(text, range.offset, range.length).length;
      while (cursor < end) {
        styles[cursor] = styles[cursor].add(range.style);
        cursor++;
      }
    });
  }
  return styles;
}

module.exports = decodeInlineStyleRanges;
