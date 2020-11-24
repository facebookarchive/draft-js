/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 */
'use strict';

var _require = require("./draftKeyUtils"),
    notEmptyKey = _require.notEmptyKey;
/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
 * and `SEGMENTED` entities should not be used for insertion behavior.
 */


function getEntityKeyForSelection(contentState, targetSelection) {
  var entityKey;

  if (targetSelection.isCollapsed()) {
    var key = targetSelection.getAnchorKey();
    var offset = targetSelection.getAnchorOffset();

    if (offset > 0) {
      entityKey = contentState.getBlockForKey(key).getEntityAt(offset - 1);

      if (entityKey !== contentState.getBlockForKey(key).getEntityAt(offset)) {
        return null;
      }

      return filterKey(contentState, entityKey);
    }

    return null;
  }

  var startKey = targetSelection.getStartKey();
  var startOffset = targetSelection.getStartOffset();
  var startBlock = contentState.getBlockForKey(startKey);
  entityKey = startOffset === startBlock.getLength() ? null : startBlock.getEntityAt(startOffset);
  return filterKey(contentState, entityKey);
}
/**
 * Determine whether an entity key corresponds to a `MUTABLE` entity. If so,
 * return it. If not, return null.
 */


function filterKey(contentState, entityKey) {
  if (notEmptyKey(entityKey)) {
    var entity = contentState.getEntity(entityKey);
    return entity.getMutability() === 'MUTABLE' ? entityKey : null;
  }

  return null;
}

module.exports = getEntityKeyForSelection;