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

import type ContentState from 'ContentState';
import type DraftEntityInstance from 'DraftEntityInstance';

const addEntityToEntityMap = require('addEntityToEntityMap');

function addEntityToContentState(
  contentState: ContentState,
  instance: DraftEntityInstance,
): ContentState {
  return contentState.set(
    'entityMap',
    addEntityToEntityMap(contentState.getEntityMap(), instance),
  );
}

module.exports = addEntityToContentState;
