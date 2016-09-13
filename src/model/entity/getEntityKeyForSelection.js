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

var DraftEntity = require('DraftEntity');

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
  var entityKeyBeforeCaret;
  var entityKeyAfterCaret;
  var caretOutsideEntity;

  if (targetSelection.isCollapsed()) {
    var key = targetSelection.getAnchorKey();
    var offset = targetSelection.getAnchorOffset();

    if (offset > 0) {
      entityKeyBeforeCaret = contentState.getBlockForKey(key).getEntityAt(offset - 1);
      entityKeyAfterCaret = contentState.getBlockForKey(key).getEntityAt(offset);
      caretOutsideEntity = (entityKeyBeforeCaret !== entityKeyAfterCaret);

      return filterKey(entityKeyBeforeCaret, caretOutsideEntity);
    }
    return null;
  }

  var startKey = targetSelection.getStartKey();
  var startOffset = targetSelection.getStartOffset();
  var startBlock = contentState.getBlockForKey(startKey);

  entityKeyBeforeCaret = startOffset === startBlock.getLength() ?
    null :
    startBlock.getEntityAt(startOffset);

  return filterKey(entityKeyBeforeCaret);
}

/**
* Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
* return it. If not, return null.
*/
function filterKey(
  entityKey: ?string,
  caretOutsideEntity: ?bool,
): ?string {
  if (entityKey) {
    var entity = DraftEntity.get(entityKey);

    // if entity is mutable and caret is inside it, return it
    if (entity.getMutability() === 'MUTABLE' && !caretOutsideEntity) {
      return entityKey;
    }

    // entity is mutable and the caret is outside of the entity
    // if it is contiguous, return it, else null
    if (entity.getMutability() === 'MUTABLE' && caretOutsideEntity) {
      return (entity.getContiguity()) ? entityKey : null;
    }
  }
  return null;
}

module.exports = getEntityKeyForSelection;
