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

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';

const Immutable = require('immutable');

const {OrderedMap} = Immutable;

const BlockMapBuilder = {
  createFromArray(blocks: Array<BlockNodeRecord>): BlockMap {
    return OrderedMap(blocks.map(block => [block.getKey(), block]));
  },
};

module.exports = BlockMapBuilder;
