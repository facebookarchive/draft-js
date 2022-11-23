/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type ContentState from 'ContentState';

const UnicodeBidiService = require('UnicodeBidiService');

const Immutable = require('immutable');
const nullthrows = require('nullthrows');

const {OrderedMap} = Immutable;

let bidiService;

const EditorBidiService = {
  getDirectionMap(
    content: ContentState,
    prevBidiMap: ?OrderedMap<any, any>,
  ): OrderedMap<any, any> {
    if (!bidiService) {
      bidiService = new UnicodeBidiService();
    } else {
      bidiService.reset();
    }

    const blockMap = content.getBlockMap();
    const nextBidi = blockMap
      .valueSeq()
      .map(block => nullthrows(bidiService).getDirection(block.getText()));
    const bidiMap = OrderedMap(blockMap.keySeq().zip(nextBidi));

    if (prevBidiMap != null && Immutable.is(prevBidiMap, bidiMap)) {
      return prevBidiMap;
    }

    return bidiMap;
  },
};

module.exports = EditorBidiService;
