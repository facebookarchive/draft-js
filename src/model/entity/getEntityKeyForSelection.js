/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEntityKeyForSelection
 * @typechecks
 * @flow
 */

'use strict';

const DraftEntity = require('DraftEntity');

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
 * and `SEGMENTED` entities should not be used for insertion behavior.
 */
function getEntityKeyForSelection(
  contentState: ContentState,
  targetSelection: SelectionState
): ?string {
  let entityKey;

  if (targetSelection.isCollapsed()) {
    const key = targetSelection.getAnchorKey();
    const offset = targetSelection.getAnchorOffset();
    if (offset > 0) {
      entityKey = contentState.getBlockForKey(key).getEntityAt(offset - 1);
      return filterKey(entityKey);
    }
    return null;
  }

  const startKey = targetSelection.getStartKey();
  const startOffset = targetSelection.getStartOffset();
  const startBlock = contentState.getBlockForKey(startKey);

  entityKey = startOffset === startBlock.getLength() ?
    null :
    startBlock.getEntityAt(startOffset);

  return filterKey(entityKey);
}

/**
 * Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
 * return it. If not, return null.
 */
function filterKey(
  entityKey: ?string
): ?string {
  if (entityKey) {
    const entity = DraftEntity.get(entityKey);
    return entity.getMutability() === 'MUTABLE' ? entityKey : null;
  }
  return null;
}

module.exports = getEntityKeyForSelection;
