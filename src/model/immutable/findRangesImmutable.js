/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import type {List} from 'immutable';

/**
 * Search through an array to find contiguous stretches of elements that
 * match a specified filter function.
 *
 * When ranges are found, execute a specified `found` function to supply
 * the values to the caller.
 */
function findRangesImmutable<T>(
  haystack: List<T>,
  areEqualFn: (a: T, b: T) => boolean,
  filterFn: (value: T) => boolean,
  foundFn: (start: number, end: number) => void,
): void {
  if (!haystack.size) {
    return;
  }

  let cursor: number = 0;

  haystack.reduce((value: T, nextValue, nextIndex) => {
    if (!areEqualFn(value, nextValue)) {
      if (filterFn(value)) {
        foundFn(cursor, nextIndex);
      }
      cursor = nextIndex;
    }
    return nextValue;
  });

  filterFn(haystack.last()) && foundFn(cursor, haystack.count());
}

module.exports = findRangesImmutable;
