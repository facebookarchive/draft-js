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

import type ContentState from 'ContentState';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';

/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
 * and `SEGMENTED` entities should not be used for insertion behavior.
 */
function getEntityKeyForSelection(
  contentState: ContentState,
  targetSelection: SelectionState,
): ?string {
  if (targetSelection.isCollapsed()) {
    var key = targetSelection.getAnchorKey();
    var offset = targetSelection.getAnchorOffset();
    if (offset > 0) {
      var currentBlock = contentState.getBlockForKey(key);
      var currentEntityKey = currentBlock.getEntityAt(offset);
      var entityKeyBefore = currentBlock.getEntityAt(offset - 1);

      if (entityKeyBefore) {
        var entityBefore = contentState.getEntity(entityKeyBefore);

        if (entityBefore.getType() === 'LINK') {
          if (entityKeyBefore === currentEntityKey) {
            return filterKey(contentState.getEntityMap(), entityKeyBefore);
          }
          return null;
        }
      }
      return filterKey(contentState.getEntityMap(), entityKeyBefore);
    }
    return null;
  }

  var startKey = targetSelection.getStartKey();
  var startOffset = targetSelection.getStartOffset();
  var startBlock = contentState.getBlockForKey(startKey);

  var entityKey = startOffset === startBlock.getLength() ?
    null :
    startBlock.getEntityAt(startOffset);

  return filterKey(contentState.getEntityMap(), entityKey);
}

/**
 * Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
 * return it. If not, return null.
 */
function filterKey(
  entityMap: EntityMap,
  entityKey: ?string,
): ?string {
  if (entityKey) {
    var entity = entityMap.__get(entityKey);
    return entity.getMutability() === 'MUTABLE' ? entityKey : null;
  }
  return null;
}

module.exports = getEntityKeyForSelection;
