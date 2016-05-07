/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule addEntityToContentState
 * @typechecks
 * @flow
 */

'use strict';

const generateRandomKey = require('generateRandomKey');

import type ContentState from 'ContentState';
import type DraftEntityInstance from 'DraftEntityInstance';

function addEntityToContentState(
  contentState: ContentState,
  instance: DraftEntityInstance
): ContentState {
  const newKey = generateRandomKey();
  const newEntityMap = contentState.getEntityMap().set(newKey, instance);
  return contentState.set('entityMap', newEntityMap);
}

module.exports = addEntityToContentState;
