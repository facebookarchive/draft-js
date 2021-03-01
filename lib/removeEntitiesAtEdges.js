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

var CharacterMetadata = require("./CharacterMetadata");

var findRangesImmutable = require("./findRangesImmutable");

var invariant = require("fbjs/lib/invariant");

function removeEntitiesAtEdges(contentState, selectionState) {
  var blockMap = contentState.getBlockMap();
  var updatedBlocks = {};
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var startBlock = blockMap.get(startKey);
  var updatedStart = removeForBlock(contentState, startBlock, startOffset);

  if (updatedStart !== startBlock) {
    updatedBlocks[startKey] = updatedStart;
  }

  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();
  var endBlock = blockMap.get(endKey);

  if (startKey === endKey) {
    endBlock = updatedStart;
  }

  var updatedEnd = removeForBlock(contentState, endBlock, endOffset);

  if (updatedEnd !== endBlock) {
    updatedBlocks[endKey] = updatedEnd;
  }

  if (!Object.keys(updatedBlocks).length) {
    return contentState.set('selectionAfter', selectionState);
  }

  return contentState.merge({
    blockMap: blockMap.merge(updatedBlocks),
    selectionAfter: selectionState
  });
}
/**
 * Given a list of characters and an offset that is in the middle of an entity,
 * returns the start and end of the entity that is overlapping the offset.
 * Note: This method requires that the offset be in an entity range.
 */


function getRemovalRange(characters, entityKey, offset) {
  var removalRange; // Iterates through a list looking for ranges of matching items
  // based on the 'isEqual' callback.
  // Then instead of returning the result, call the 'found' callback
  // with each range.
  // Then filters those ranges based on the 'filter' callback
  //
  // Here we use it to find ranges of characters with the same entity key.

  findRangesImmutable(characters, // the list to iterate through
  function (a, b) {
    return a.getEntity() === b.getEntity();
  }, // 'isEqual' callback
  function (element) {
    return element.getEntity() === entityKey;
  }, // 'filter' callback
  function (start, end) {
    // 'found' callback
    if (start <= offset && end >= offset) {
      // this entity overlaps the offset index
      removalRange = {
        start: start,
        end: end
      };
    }
  });
  !(typeof removalRange === 'object') ? process.env.NODE_ENV !== "production" ? invariant(false, 'Removal range must exist within character list.') : invariant(false) : void 0;
  return removalRange;
}

function removeForBlock(contentState, block, offset) {
  var chars = block.getCharacterList();
  var charBefore = offset > 0 ? chars.get(offset - 1) : undefined;
  var charAfter = offset < chars.count() ? chars.get(offset) : undefined;
  var entityBeforeCursor = charBefore ? charBefore.getEntity() : undefined;
  var entityAfterCursor = charAfter ? charAfter.getEntity() : undefined;

  if (entityAfterCursor && entityAfterCursor === entityBeforeCursor) {
    var entity = contentState.getEntity(entityAfterCursor);

    if (entity.getMutability() !== 'MUTABLE') {
      var _getRemovalRange = getRemovalRange(chars, entityAfterCursor, offset),
          start = _getRemovalRange.start,
          end = _getRemovalRange.end;

      var current;

      while (start < end) {
        current = chars.get(start);
        chars = chars.set(start, CharacterMetadata.applyEntity(current, null));
        start++;
      }

      return block.set('characterList', chars);
    }
  }

  return block;
}

module.exports = removeEntitiesAtEdges;