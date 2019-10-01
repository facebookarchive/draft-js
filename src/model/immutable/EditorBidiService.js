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

import type ContentState from 'ContentState';

const Immutable = require('immutable');
const UnicodeBidiDirection = require('UnicodeBidiDirection');

const {OrderedMap} = Immutable;

const EditorBidiService = {
  getDirectionMap: function(
    content: ContentState,
    prevBidiMap: ?OrderedMap<any, any>,
  ): OrderedMap<any, any> {
    const blockMap = content.getBlockMap();

    if (prevBidiMap && blockMap.size === prevBidiMap.size) {
      if (blockMap.keySeq().every(blockKey => prevBidiMap.has(blockKey))) {
        return prevBidiMap;
      }
    }

    return blockMap.map(() => UnicodeBidiDirection.LTR).toOrderedMap();
  },
};

module.exports = EditorBidiService;
