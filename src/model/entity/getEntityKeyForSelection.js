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

import type ContentState from 'ContentState';
import type SelectionState from 'SelectionState';

const {notEmptyKey} = require('draftKeyUtils');

/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
 * and `SEGMENTED` entities should not be used for insertion behavior.
 */
function getEntityKeyForSelection(
  contentState: ContentState,
  targetSelection: SelectionState,
): ?string {
  let entityKey;

  if (targetSelection.isCollapsed()) {
    const key = targetSelection.getAnchorKey();
    const offset = targetSelection.getAnchorOffset();
    if (offset > 0) {
      entityKey = contentState.getBlockForKey(key).getEntityAt(offset - 1);
      if (entityKey !== contentState.getBlockForKey(key).getEntityAt(offset)) {
        return null;
      }
      return filterKey(contentState, entityKey);
    }
    return null;
  }

  const startKey = targetSelection.getStartKey();
  const startOffset = targetSelection.getStartOffset();
  const startBlock = contentState.getBlockForKey(startKey);

  entityKey =
    startOffset === startBlock.getLength()
      ? null
      : startBlock.getEntityAt(startOffset);

  return filterKey(contentState, entityKey);
}

/**
 * Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
 * return it. If not, return null.
 */
function filterKey(contentState: ContentState, entityKey: ?string): ?string {
  if (notEmptyKey(entityKey)) {
    const entity = contentState.getEntity(entityKey);
    return entity.getMutability() === 'MUTABLE' ? entityKey : null;
  }
  return null;
}

module.exports = getEntityKeyForSelection;
