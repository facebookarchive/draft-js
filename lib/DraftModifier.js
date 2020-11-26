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

var ContentStateInlineStyle = require("./ContentStateInlineStyle");

var applyEntityToContentState = require("./applyEntityToContentState");

var getCharacterRemovalRange = require("./getCharacterRemovalRange");

var getContentStateFragment = require("./getContentStateFragment");

var Immutable = require("immutable");

var insertFragmentIntoContentState = require("./insertFragmentIntoContentState");

var insertTextIntoContentState = require("./insertTextIntoContentState");

var invariant = require("fbjs/lib/invariant");

var modifyBlockForContentState = require("./modifyBlockForContentState");

var removeEntitiesAtEdges = require("./removeEntitiesAtEdges");

var removeRangeFromContentState = require("./removeRangeFromContentState");

var splitBlockInContentState = require("./splitBlockInContentState");

var OrderedSet = Immutable.OrderedSet;
/**
 * `DraftModifier` provides a set of convenience methods that apply
 * modifications to a `ContentState` object based on a target `SelectionState`.
 *
 * Any change to a `ContentState` should be decomposable into a series of
 * transaction functions that apply the required changes and return output
 * `ContentState` objects.
 *
 * These functions encapsulate some of the most common transaction sequences.
 */

var DraftModifier = {
  replaceText: function replaceText(contentState, rangeToReplace, text, inlineStyle, entityKey) {
    var withoutEntities = removeEntitiesAtEdges(contentState, rangeToReplace);
    var withoutText = removeRangeFromContentState(withoutEntities, rangeToReplace);
    var character = CharacterMetadata.create({
      style: inlineStyle || OrderedSet(),
      entity: entityKey || null
    });
    return insertTextIntoContentState(withoutText, withoutText.getSelectionAfter(), text, character);
  },
  insertText: function insertText(contentState, targetRange, text, inlineStyle, entityKey) {
    !targetRange.isCollapsed() ? process.env.NODE_ENV !== "production" ? invariant(false, 'Target range must be collapsed for `insertText`.') : invariant(false) : void 0;
    return DraftModifier.replaceText(contentState, targetRange, text, inlineStyle, entityKey);
  },
  moveText: function moveText(contentState, removalRange, targetRange) {
    var movedFragment = getContentStateFragment(contentState, removalRange);
    var afterRemoval = DraftModifier.removeRange(contentState, removalRange, 'backward');
    return DraftModifier.replaceWithFragment(afterRemoval, targetRange, movedFragment);
  },
  replaceWithFragment: function replaceWithFragment(contentState, targetRange, fragment) {
    var mergeBlockData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'REPLACE_WITH_NEW_DATA';
    var withoutEntities = removeEntitiesAtEdges(contentState, targetRange);
    var withoutText = removeRangeFromContentState(withoutEntities, targetRange);
    return insertFragmentIntoContentState(withoutText, withoutText.getSelectionAfter(), fragment, mergeBlockData);
  },
  removeRange: function removeRange(contentState, rangeToRemove, removalDirection) {
    var startKey, endKey, startBlock, endBlock;

    if (rangeToRemove.getIsBackward()) {
      rangeToRemove = rangeToRemove.merge({
        anchorKey: rangeToRemove.getFocusKey(),
        anchorOffset: rangeToRemove.getFocusOffset(),
        focusKey: rangeToRemove.getAnchorKey(),
        focusOffset: rangeToRemove.getAnchorOffset(),
        isBackward: false
      });
    }

    startKey = rangeToRemove.getAnchorKey();
    endKey = rangeToRemove.getFocusKey();
    startBlock = contentState.getBlockForKey(startKey);
    endBlock = contentState.getBlockForKey(endKey);
    var startOffset = rangeToRemove.getStartOffset();
    var endOffset = rangeToRemove.getEndOffset();
    var startEntityKey = startBlock.getEntityAt(startOffset);
    var endEntityKey = endBlock.getEntityAt(endOffset - 1); // Check whether the selection state overlaps with a single entity.
    // If so, try to remove the appropriate substring of the entity text.

    if (startKey === endKey) {
      if (startEntityKey && startEntityKey === endEntityKey) {
        var adjustedRemovalRange = getCharacterRemovalRange(contentState.getEntityMap(), startBlock, endBlock, rangeToRemove, removalDirection);
        return removeRangeFromContentState(contentState, adjustedRemovalRange);
      }
    }

    var withoutEntities = removeEntitiesAtEdges(contentState, rangeToRemove);
    return removeRangeFromContentState(withoutEntities, rangeToRemove);
  },
  splitBlock: function splitBlock(contentState, selectionState) {
    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    var withoutText = removeRangeFromContentState(withoutEntities, selectionState);
    return splitBlockInContentState(withoutText, withoutText.getSelectionAfter());
  },
  applyInlineStyle: function applyInlineStyle(contentState, selectionState, inlineStyle) {
    return ContentStateInlineStyle.add(contentState, selectionState, inlineStyle);
  },
  removeInlineStyle: function removeInlineStyle(contentState, selectionState, inlineStyle) {
    return ContentStateInlineStyle.remove(contentState, selectionState, inlineStyle);
  },
  setBlockType: function setBlockType(contentState, selectionState, blockType) {
    return modifyBlockForContentState(contentState, selectionState, function (block) {
      return block.merge({
        type: blockType,
        depth: 0
      });
    });
  },
  setBlockData: function setBlockData(contentState, selectionState, blockData) {
    return modifyBlockForContentState(contentState, selectionState, function (block) {
      return block.merge({
        data: blockData
      });
    });
  },
  mergeBlockData: function mergeBlockData(contentState, selectionState, blockData) {
    return modifyBlockForContentState(contentState, selectionState, function (block) {
      return block.merge({
        data: block.getData().merge(blockData)
      });
    });
  },
  applyEntity: function applyEntity(contentState, selectionState, entityKey) {
    var withoutEntities = removeEntitiesAtEdges(contentState, selectionState);
    return applyEntityToContentState(withoutEntities, selectionState, entityKey);
  }
};
module.exports = DraftModifier;