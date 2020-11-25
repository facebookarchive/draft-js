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

var ContentBlockNode = require("./ContentBlockNode");

var getNextDelimiterBlockKey = require("./getNextDelimiterBlockKey");

var Immutable = require("immutable");

var invariant = require("fbjs/lib/invariant");

var OrderedMap = Immutable.OrderedMap,
    List = Immutable.List;

var transformBlock = function transformBlock(key, blockMap, func) {
  if (!key) {
    return;
  }

  var block = blockMap.get(key);

  if (!block) {
    return;
  }

  blockMap.set(key, func(block));
};

var updateBlockMapLinks = function updateBlockMapLinks(blockMap, originalBlockToBeMoved, originalTargetBlock, insertionMode, isExperimentalTreeBlock) {
  if (!isExperimentalTreeBlock) {
    return blockMap;
  } // possible values of 'insertionMode' are: 'after', 'before'


  var isInsertedAfterTarget = insertionMode === 'after';
  var originalBlockKey = originalBlockToBeMoved.getKey();
  var originalTargetKey = originalTargetBlock.getKey();
  var originalParentKey = originalBlockToBeMoved.getParentKey();
  var originalNextSiblingKey = originalBlockToBeMoved.getNextSiblingKey();
  var originalPrevSiblingKey = originalBlockToBeMoved.getPrevSiblingKey();
  var newParentKey = originalTargetBlock.getParentKey();
  var newNextSiblingKey = isInsertedAfterTarget ? originalTargetBlock.getNextSiblingKey() : originalTargetKey;
  var newPrevSiblingKey = isInsertedAfterTarget ? originalTargetKey : originalTargetBlock.getPrevSiblingKey();
  return blockMap.withMutations(function (blocks) {
    // update old parent
    transformBlock(originalParentKey, blocks, function (block) {
      var parentChildrenList = block.getChildKeys();
      return block.merge({
        children: parentChildrenList["delete"](parentChildrenList.indexOf(originalBlockKey))
      });
    }); // update old prev

    transformBlock(originalPrevSiblingKey, blocks, function (block) {
      return block.merge({
        nextSibling: originalNextSiblingKey
      });
    }); // update old next

    transformBlock(originalNextSiblingKey, blocks, function (block) {
      return block.merge({
        prevSibling: originalPrevSiblingKey
      });
    }); // update new next

    transformBlock(newNextSiblingKey, blocks, function (block) {
      return block.merge({
        prevSibling: originalBlockKey
      });
    }); // update new prev

    transformBlock(newPrevSiblingKey, blocks, function (block) {
      return block.merge({
        nextSibling: originalBlockKey
      });
    }); // update new parent

    transformBlock(newParentKey, blocks, function (block) {
      var newParentChildrenList = block.getChildKeys();
      var targetBlockIndex = newParentChildrenList.indexOf(originalTargetKey);
      var insertionIndex = isInsertedAfterTarget ? targetBlockIndex + 1 : targetBlockIndex !== 0 ? targetBlockIndex - 1 : 0;
      var newChildrenArray = newParentChildrenList.toArray();
      newChildrenArray.splice(insertionIndex, 0, originalBlockKey);
      return block.merge({
        children: List(newChildrenArray)
      });
    }); // update block

    transformBlock(originalBlockKey, blocks, function (block) {
      return block.merge({
        nextSibling: newNextSiblingKey,
        prevSibling: newPrevSiblingKey,
        parent: newParentKey
      });
    });
  });
};

var moveBlockInContentState = function moveBlockInContentState(contentState, blockToBeMoved, targetBlock, insertionMode) {
  !(insertionMode !== 'replace') ? process.env.NODE_ENV !== "production" ? invariant(false, 'Replacing blocks is not supported.') : invariant(false) : void 0;
  var targetKey = targetBlock.getKey();
  var blockKey = blockToBeMoved.getKey();
  !(blockKey !== targetKey) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;
  var blockMap = contentState.getBlockMap();
  var isExperimentalTreeBlock = blockToBeMoved instanceof ContentBlockNode;
  var blocksToBeMoved = [blockToBeMoved];
  var blockMapWithoutBlocksToBeMoved = blockMap["delete"](blockKey);

  if (isExperimentalTreeBlock) {
    blocksToBeMoved = [];
    blockMapWithoutBlocksToBeMoved = blockMap.withMutations(function (blocks) {
      var nextSiblingKey = blockToBeMoved.getNextSiblingKey();
      var nextDelimiterBlockKey = getNextDelimiterBlockKey(blockToBeMoved, blocks);
      blocks.toSeq().skipUntil(function (block) {
        return block.getKey() === blockKey;
      }).takeWhile(function (block) {
        var key = block.getKey();
        var isBlockToBeMoved = key === blockKey;
        var hasNextSiblingAndIsNotNextSibling = nextSiblingKey && key !== nextSiblingKey;
        var doesNotHaveNextSiblingAndIsNotDelimiter = !nextSiblingKey && block.getParentKey() && (!nextDelimiterBlockKey || key !== nextDelimiterBlockKey);
        return !!(isBlockToBeMoved || hasNextSiblingAndIsNotNextSibling || doesNotHaveNextSiblingAndIsNotDelimiter);
      }).forEach(function (block) {
        blocksToBeMoved.push(block);
        blocks["delete"](block.getKey());
      });
    });
  }

  var blocksBefore = blockMapWithoutBlocksToBeMoved.toSeq().takeUntil(function (v) {
    return v === targetBlock;
  });
  var blocksAfter = blockMapWithoutBlocksToBeMoved.toSeq().skipUntil(function (v) {
    return v === targetBlock;
  }).skip(1);
  var slicedBlocks = blocksToBeMoved.map(function (block) {
    return [block.getKey(), block];
  });
  var newBlocks = OrderedMap();

  if (insertionMode === 'before') {
    var blockBefore = contentState.getBlockBefore(targetKey);
    !(!blockBefore || blockBefore.getKey() !== blockToBeMoved.getKey()) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;
    newBlocks = blocksBefore.concat([].concat(slicedBlocks, [[targetKey, targetBlock]]), blocksAfter).toOrderedMap();
  } else if (insertionMode === 'after') {
    var blockAfter = contentState.getBlockAfter(targetKey);
    !(!blockAfter || blockAfter.getKey() !== blockKey) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Block cannot be moved next to itself.') : invariant(false) : void 0;
    newBlocks = blocksBefore.concat([[targetKey, targetBlock]].concat(slicedBlocks), blocksAfter).toOrderedMap();
  }

  return contentState.merge({
    blockMap: updateBlockMapLinks(newBlocks, blockToBeMoved, targetBlock, insertionMode, isExperimentalTreeBlock),
    selectionBefore: contentState.getSelectionAfter(),
    selectionAfter: contentState.getSelectionAfter().merge({
      anchorKey: blockKey,
      focusKey: blockKey
    })
  });
};

module.exports = moveBlockInContentState;