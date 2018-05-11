/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';

const Immutable = require('immutable');

const {OrderedMap} = Immutable;

const BlockMapBuilder = {
  createFromArray: function(blocks: Array<BlockNodeRecord>): BlockMap {
    return OrderedMap(blocks.map(block => [block.getKey(), block]));
  },
};

module.exports = BlockMapBuilder;
