/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BlockMapBuilder
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type ContentBlock from 'ContentBlock';

var Immutable = require('immutable');

var {OrderedMap} = Immutable;

var BlockMapBuilder = {
  createFromArray: function(
    blocks: Array<ContentBlock>,
  ): BlockMap {
    /* $FlowFixMe(>=0.53.0 site=www,mobile) -
     * should be fixed by * https://github.com/facebook/immutable-js/pull/1112
     */
    return OrderedMap(
      blocks.map(
        block => [block.getKey(), block],
      ),
    );
  },
};

module.exports = BlockMapBuilder;
