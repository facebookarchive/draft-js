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

const {OrderedSet} = require('immutable');

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
