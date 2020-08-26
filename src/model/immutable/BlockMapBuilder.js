/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';

import Immutable from 'immutable';

const {OrderedMap} = Immutable;

export function createFromArray(blocks: Array<BlockNodeRecord>): BlockMap {
  return OrderedMap(blocks.map(block => [block.getKey(), block]));
}
