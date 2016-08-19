/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createEntityInContentState
 * @typechecks
 * @flow
 */

'use strict';

const DraftEntityInstance = require('DraftEntityInstance');

const addEntityToContentState = require('addEntityToContentState');

import type ContentState from 'ContentState';
import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';

function createEntityInContentState(
  contentState: ContentState,
  type: DraftEntityType,
  mutability: DraftEntityMutability,
  data?: Object
): ContentState {
  return addEntityToContentState(
    contentState,
    new DraftEntityInstance({type, mutability, data: data || {}})
  );
}

module.exports = createEntityInContentState;
