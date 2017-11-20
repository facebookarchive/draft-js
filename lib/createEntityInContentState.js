/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createEntityInContentState
 * @format
 * 
 */

'use strict';

var DraftEntityInstance = require('./DraftEntityInstance');

var addEntityToContentState = require('./addEntityToContentState');

function createEntityInContentState(contentState, type, mutability, data) {
  return addEntityToContentState(contentState, new DraftEntityInstance({ type: type, mutability: mutability, data: data || {} }));
}

module.exports = createEntityInContentState;