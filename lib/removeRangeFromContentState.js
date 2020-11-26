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

var List = Immutable.List,
    Map = Immutable.Map;

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
/**
 * Ancestors needs to be preserved when there are non selected
 * children to make sure we do not leave any orphans behind
 */


var getAncestorsKeys = function getAncestorsKeys(blockKey, blockMap) {
  var parents = [];

  if (!blockKey) {
    return parents;
  }

  var blockNode = blockMap.get(blockKey);

  while (blockNode && blockNode.getParentKey()) {
    var parentKey = blockNode.getParentKey();

    if (parentKey) {
      parents.push(parentKey);
    }

    blockNode = parentKey ? blockMap.get(parentKey) : null;
  }

  return parents;
};
/**
 * Get all next delimiter keys until we hit a root delimiter and return
 * an array of key references
 */


var getNextDelimitersBlockKeys = function getNextDelimitersBlockKeys(block, blockMap) {
  var nextDelimiters = [];

  if (!block) {
    return nextDelimiters;
  }

  var nextDelimiter = getNextDelimiterBlockKey(block, blockMap);

  while (nextDelimiter && blockMap.get(nextDelimiter)) {
    var _block = blockMap.get(nextDelimiter);

    nextDelimiters.push(nextDelimiter); // we do not need to keep checking all root node siblings, just the first occurance

    nextDelimiter = _block.getParentKey() ? getNextDelimiterBlockKey(_block, blockMap) : null;
  }

  return nextDelimiters;
};

var getNextValidSibling = function getNextValidSibling(block, blockMap, originalBlockMap) {
  if (!block) {
    return null;
  } // note that we need to make sure we refer to the original block since this
  // function is called within a withMutations


  var nextValidSiblingKey = originalBlockMap.get(block.getKey()).getNextSiblingKey();

  while (nextValidSiblingKey && !blockMap.get(nextValidSiblingKey)) {
    nextValidSiblingKey = originalBlockMap.get(nextValidSiblingKey).getNextSiblingKey() || null;
  }

  return nextValidSiblingKey;
};

var getPrevValidSibling = function getPrevValidSibling(block, blockMap, originalBlockMap) {
  if (!block) {
    return null;
  } // note that we need to make sure we refer to the original block since this
  // function is called within a withMutations


  var prevValidSiblingKey = originalBlockMap.get(block.getKey()).getPrevSiblingKey();

  while (prevValidSiblingKey && !blockMap.get(prevValidSiblingKey)) {
    prevValidSiblingKey = originalBlockMap.get(prevValidSiblingKey).getPrevSiblingKey() || null;
  }

  return prevValidSiblingKey;
};

var updateBlockMapLinks = function updateBlockMapLinks(blockMap, startBlock, endBlock, originalBlockMap) {
  return blockMap.withMutations(function (blocks) {
    // update start block if its retained
    transformBlock(startBlock.getKey(), blocks, function (block) {
      return block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
      });
    }); // update endblock if its retained

    transformBlock(endBlock.getKey(), blocks, function (block) {
      return block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
      });
    }); // update start block parent ancestors

    getAncestorsKeys(startBlock.getKey(), originalBlockMap).forEach(function (parentKey) {
      return transformBlock(parentKey, blocks, function (block) {
        return block.merge({
          children: block.getChildKeys().filter(function (key) {
            return blocks.get(key);
          }),
          nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
          prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
        });
      });
    }); // update start block next - can only happen if startBlock == endBlock

    transformBlock(startBlock.getNextSiblingKey(), blocks, function (block) {
      return block.merge({
        prevSibling: startBlock.getPrevSiblingKey()
      });
    }); // update start block prev

    transformBlock(startBlock.getPrevSiblingKey(), blocks, function (block) {
      return block.merge({
        nextSibling: getNextValidSibling(block, blocks, originalBlockMap)
      });
    }); // update end block next

    transformBlock(endBlock.getNextSiblingKey(), blocks, function (block) {
      return block.merge({
        prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
      });
    }); // update end block prev

    transformBlock(endBlock.getPrevSiblingKey(), blocks, function (block) {
      return block.merge({
        nextSibling: endBlock.getNextSiblingKey()
      });
    }); // update end block parent ancestors

    getAncestorsKeys(endBlock.getKey(), originalBlockMap).forEach(function (parentKey) {
      transformBlock(parentKey, blocks, function (block) {
        return block.merge({
          children: block.getChildKeys().filter(function (key) {
            return blocks.get(key);
          }),
          nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
          prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
        });
      });
    }); // update next delimiters all the way to a root delimiter

    getNextDelimitersBlockKeys(endBlock, originalBlockMap).forEach(function (delimiterKey) {
      return transformBlock(delimiterKey, blocks, function (block) {
        return block.merge({
          nextSibling: getNextValidSibling(block, blocks, originalBlockMap),
          prevSibling: getPrevValidSibling(block, blocks, originalBlockMap)
        });
      });
    }); // if parent (startBlock) was deleted

    if (blockMap.get(startBlock.getKey()) == null && blockMap.get(endBlock.getKey()) != null && endBlock.getParentKey() === startBlock.getKey() && endBlock.getPrevSiblingKey() == null) {
      var prevSiblingKey = startBlock.getPrevSiblingKey(); // endBlock becomes next sibling of parent's prevSibling

      transformBlock(endBlock.getKey(), blocks, function (block) {
        return block.merge({
          prevSibling: prevSiblingKey
        });
      });
      transformBlock(prevSiblingKey, blocks, function (block) {
        return block.merge({
          nextSibling: endBlock.getKey()
        });
      }); // Update parent for previous parent's children, and children for that parent

      var prevSibling = prevSiblingKey ? blockMap.get(prevSiblingKey) : null;
      var newParentKey = prevSibling ? prevSibling.getParentKey() : null;
      startBlock.getChildKeys().forEach(function (childKey) {
        transformBlock(childKey, blocks, function (block) {
          return block.merge({
            parent: newParentKey // set to null if there is no parent

          });
        });
      });

      if (newParentKey != null) {
        var newParent = blockMap.get(newParentKey);
        transformBlock(newParentKey, blocks, function (block) {
          return block.merge({
            children: newParent.getChildKeys().concat(startBlock.getChildKeys())
          });
        });
      } // last child of deleted parent should point to next sibling


      transformBlock(startBlock.getChildKeys().find(function (key) {
        var block = blockMap.get(key);
        return block.getNextSiblingKey() === null;
      }), blocks, function (block) {
        return block.merge({
          nextSibling: startBlock.getNextSiblingKey()
        });
      });
    }
  });
};

var removeRangeFromContentState = function removeRangeFromContentState(contentState, selectionState) {
  if (selectionState.isCollapsed()) {
    return contentState;
  }

  var blockMap = contentState.getBlockMap();
  var startKey = selectionState.getStartKey();
  var startOffset = selectionState.getStartOffset();
  var endKey = selectionState.getEndKey();
  var endOffset = selectionState.getEndOffset();
  var startBlock = blockMap.get(startKey);
  var endBlock = blockMap.get(endKey); // we assume that ContentBlockNode and ContentBlocks are not mixed together

  var isExperimentalTreeBlock = startBlock instanceof ContentBlockNode; // used to retain blocks that should not be deleted to avoid orphan children

  var parentAncestors = [];

  if (isExperimentalTreeBlock) {
    var endBlockchildrenKeys = endBlock.getChildKeys();
    var endBlockAncestors = getAncestorsKeys(endKey, blockMap); // endBlock has unselected siblings so we can not remove its ancestors parents

    if (endBlock.getNextSiblingKey()) {
      parentAncestors = parentAncestors.concat(endBlockAncestors);
    } // endBlock has children so can not remove this block or any of its ancestors


    if (!endBlockchildrenKeys.isEmpty()) {
      parentAncestors = parentAncestors.concat(endBlockAncestors.concat([endKey]));
    } // we need to retain all ancestors of the next delimiter block


    parentAncestors = parentAncestors.concat(getAncestorsKeys(getNextDelimiterBlockKey(endBlock, blockMap), blockMap));
  }

  var characterList;

  if (startBlock === endBlock) {
    characterList = removeFromList(startBlock.getCharacterList(), startOffset, endOffset);
  } else {
    characterList = startBlock.getCharacterList().slice(0, startOffset).concat(endBlock.getCharacterList().slice(endOffset));
  }

  var modifiedStart = startBlock.merge({
    text: startBlock.getText().slice(0, startOffset) + endBlock.getText().slice(endOffset),
    characterList: characterList
  }); // If cursor (collapsed) is at the start of the first child, delete parent
  // instead of child

  var shouldDeleteParent = isExperimentalTreeBlock && startOffset === 0 && endOffset === 0 && endBlock.getParentKey() === startKey && endBlock.getPrevSiblingKey() == null;
  var newBlocks = shouldDeleteParent ? Map([[startKey, null]]) : blockMap.toSeq().skipUntil(function (_, k) {
    return k === startKey;
  }).takeUntil(function (_, k) {
    return k === endKey;
  }).filter(function (_, k) {
    return parentAncestors.indexOf(k) === -1;
  }).concat(Map([[endKey, null]])).map(function (_, k) {
    return k === startKey ? modifiedStart : null;
  });
  var updatedBlockMap = blockMap.merge(newBlocks).filter(function (block) {
    return !!block;
  }); // Only update tree block pointers if the range is across blocks

  if (isExperimentalTreeBlock && startBlock !== endBlock) {
    updatedBlockMap = updateBlockMapLinks(updatedBlockMap, startBlock, endBlock, blockMap);
  }

  return contentState.merge({
    blockMap: updatedBlockMap,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: startKey,
      focusOffset: startOffset,
      isBackward: false
    })
  });
};
/**
 * Maintain persistence for target list when removing characters on the
 * head and tail of the character list.
 */


var removeFromList = function removeFromList(targetList, startOffset, endOffset) {
  if (startOffset === 0) {
    while (startOffset < endOffset) {
      targetList = targetList.shift();
      startOffset++;
    }
  } else if (endOffset === targetList.count()) {
    while (endOffset > startOffset) {
      targetList = targetList.pop();
      endOffset--;
    }
  } else {
    var head = targetList.slice(0, startOffset);
    var tail = targetList.slice(endOffset);
    targetList = head.concat(tail).toList();
  }

  return targetList;
};

module.exports = removeRangeFromContentState;