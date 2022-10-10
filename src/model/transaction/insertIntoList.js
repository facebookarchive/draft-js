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
 * Maintain persistence for target list when appending and prepending.
 */
function insertIntoList<T>(
  targetListArg: List<T>,
  toInsert: List<T>,
  offset: number,
): List<T> {
  let targetList = targetListArg;
  if (offset === targetList.count()) {
    toInsert.forEach(c => {
      targetList = targetList.push(c);
    });
  } else if (offset === 0) {
    toInsert.reverse().forEach(c => {
      targetList = targetList.unshift(c);
    });
  } else {
    const head = targetList.slice(0, offset);
    const tail = targetList.slice(offset);
    targetList = head.concat(toInsert, tail).toList();
  }
  return targetList;
}

module.exports = insertIntoList;
