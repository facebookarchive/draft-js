"use strict";

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+draft_js
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */
var ContentBlockNode = require("./ContentBlockNode");

var DraftTreeInvariants = require("./DraftTreeInvariants");

var generateRandomKey = require("./generateRandomKey");

var Immutable = require("immutable");

var invariant = require("fbjs/lib/invariant");

var verifyTree = function verifyTree(tree) {
  if (process.env.NODE_ENV !== "production") {
    !DraftTreeInvariants.isValidTree(tree) ? process.env.NODE_ENV !== "production" ? invariant(false, 'The tree is not valid') : invariant(false) : void 0;
  }
};
/**
 * This is a utility method for setting B as a child of A, ensuring
 * that parent <-> child operations are correctly mirrored
 *
 * The child is inserted at 'position' index in the list
 *
 * The block map returned by this method may not be a valid tree (siblings are
 * unaffected)
 */


var updateParentChild = function updateParentChild(blockMap, parentKey, childKey, position) {
  var parent = blockMap.get(parentKey);
  var child = blockMap.get(childKey);
  !(parent != null && child != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'parent & child should exist in the block map') : invariant(false) : void 0;
  var newBlocks = {};
  var existingChildren = parent.getChildKeys();
  !(existingChildren != null && position >= 0 && position <= existingChildren.count()) ? process.env.NODE_ENV !== "production" ? invariant(false, 'position is not valid for the number of children') : invariant(false) : void 0; // add as parent's child

  newBlocks[parentKey] = parent.merge({
    children: existingChildren.splice(position, 0, childKey)
  });
  var nextSiblingKey = null;
  var prevSiblingKey = null; // link new child as next sibling to the correct existing child

  if (position > 0) {
    prevSiblingKey = existingChildren.get(position - 1);
    newBlocks[prevSiblingKey] = blockMap.get(prevSiblingKey).merge({
      nextSibling: childKey
    });
  } // link new child as previous sibling to the correct existing child


  if (position < existingChildren.count()) {
    nextSiblingKey = existingChildren.get(position);
    newBlocks[nextSiblingKey] = blockMap.get(nextSiblingKey).merge({
      prevSibling: childKey
    });
  } // add parent & siblings to the child


  newBlocks[childKey] = child.merge({
    parent: parentKey,
    prevSibling: prevSiblingKey,
    nextSibling: nextSiblingKey
  });
  return blockMap.merge(newBlocks);
};
/**
 * This is a utility method for setting B as the next sibling of A, ensuring
 * that sibling operations are correctly mirrored
 *
 * The block map returned by this method may not be a valid tree (parent/child/
 * other siblings are unaffected)
 */


var updateSibling = function updateSibling(blockMap, prevKey, nextKey) {
  var prevSibling = blockMap.get(prevKey);
  var nextSibling = blockMap.get(nextKey);
  !(prevSibling != null && nextSibling != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'siblings should exist in the block map') : invariant(false) : void 0;
  var newBlocks = {};
  newBlocks[prevKey] = prevSibling.merge({
    nextSibling: nextKey
  });
  newBlocks[nextKey] = nextSibling.merge({
    prevSibling: prevKey
  });
  return blockMap.merge(newBlocks);
};
/**
 * This is a utility method for replacing B by C as a child of A, ensuring
 * that parent <-> child connections between A & C are correctly mirrored
 *
 * The block map returned by this method may not be a valid tree (siblings are
 * unaffected)
 */


var replaceParentChild = function replaceParentChild(blockMap, parentKey, existingChildKey, newChildKey) {
  var parent = blockMap.get(parentKey);
  var newChild = blockMap.get(newChildKey);
  !(parent != null && newChild != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'parent & child should exist in the block map') : invariant(false) : void 0;
  var existingChildren = parent.getChildKeys();
  var newBlocks = {};
  newBlocks[parentKey] = parent.merge({
    children: existingChildren.set(existingChildren.indexOf(existingChildKey), newChildKey)
  });
  newBlocks[newChildKey] = newChild.merge({
    parent: parentKey
  });
  return blockMap.merge(newBlocks);
};
/**
 * This is a utility method that abstracts the operation of creating a new parent
 * for a particular node in the block map.
 *
 * This operation respects the tree data invariants - it expects and returns a
 * valid tree.
 */


var createNewParent = function createNewParent(blockMap, key) {
  verifyTree(blockMap);
  var block = blockMap.get(key);
  !(block != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must exist in block map') : invariant(false) : void 0;
  var newParent = new ContentBlockNode({
    key: generateRandomKey(),
    text: '',
    depth: block.depth,
    type: block.type,
    children: Immutable.List([])
  }); // add the parent just before the child in the block map

  var newBlockMap = blockMap.takeUntil(function (block) {
    return block.getKey() === key;
  }).concat(Immutable.OrderedMap([[newParent.getKey(), newParent]])).concat(blockMap.skipUntil(function (block) {
    return block.getKey() === key;
  })); // set parent <-> child connection

  newBlockMap = updateParentChild(newBlockMap, newParent.getKey(), key, 0); // set siblings & parent for the new parent key to child's siblings & parent

  var prevSibling = block.getPrevSiblingKey();
  var nextSibling = block.getNextSiblingKey();
  var parent = block.getParentKey();

  if (prevSibling != null) {
    newBlockMap = updateSibling(newBlockMap, prevSibling, newParent.getKey());
  }

  if (nextSibling != null) {
    newBlockMap = updateSibling(newBlockMap, newParent.getKey(), nextSibling);
  }

  if (parent != null) {
    newBlockMap = replaceParentChild(newBlockMap, parent, key, newParent.getKey());
  }

  verifyTree(newBlockMap);
  return newBlockMap;
};
/**
 * This is a utility method that abstracts the operation of adding a node as the child
 * of its previous or next sibling.
 *
 * The previous (or next) sibling must be a valid parent node.
 *
 * This operation respects the tree data invariants - it expects and returns a
 * valid tree.
 */


var updateAsSiblingsChild = function updateAsSiblingsChild(blockMap, key, position) {
  verifyTree(blockMap);
  var block = blockMap.get(key);
  !(block != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must exist in block map') : invariant(false) : void 0;
  var newParentKey = position === 'previous' ? block.getPrevSiblingKey() : block.getNextSiblingKey();
  !(newParentKey != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'sibling is null') : invariant(false) : void 0;
  var newParent = blockMap.get(newParentKey);
  !(newParent !== null && newParent.getText() === '') ? process.env.NODE_ENV !== "production" ? invariant(false, 'parent must be a valid node') : invariant(false) : void 0;
  var newBlockMap = blockMap;

  switch (position) {
    case 'next':
      newBlockMap = updateParentChild(newBlockMap, newParentKey, key, 0);
      var prevSibling = block.getPrevSiblingKey();

      if (prevSibling != null) {
        newBlockMap = updateSibling(newBlockMap, prevSibling, newParentKey);
      } else {
        newBlockMap = newBlockMap.set(newParentKey, newBlockMap.get(newParentKey).merge({
          prevSibling: null
        }));
      } // we also need to flip the order of the sibling & block in the ordered map
      // for this case


      newBlockMap = newBlockMap.takeUntil(function (block) {
        return block.getKey() === key;
      }).concat(Immutable.OrderedMap([[newParentKey, newBlockMap.get(newParentKey)], [key, newBlockMap.get(key)]])).concat(newBlockMap.skipUntil(function (block) {
        return block.getKey() === newParentKey;
      }).slice(1));
      break;

    case 'previous':
      newBlockMap = updateParentChild(newBlockMap, newParentKey, key, newParent.getChildKeys().count());
      var nextSibling = block.getNextSiblingKey();

      if (nextSibling != null) {
        newBlockMap = updateSibling(newBlockMap, newParentKey, nextSibling);
      } else {
        newBlockMap = newBlockMap.set(newParentKey, newBlockMap.get(newParentKey).merge({
          nextSibling: null
        }));
      }

      break;
  } // remove the node as a child of its current parent


  var parentKey = block.getParentKey();

  if (parentKey != null) {
    var parent = newBlockMap.get(parentKey);
    newBlockMap = newBlockMap.set(parentKey, parent.merge({
      children: parent.getChildKeys()["delete"](parent.getChildKeys().indexOf(key))
    }));
  }

  verifyTree(newBlockMap);
  return newBlockMap;
};
/**
 * This is a utility method that abstracts the operation of moving a node up to become
 * a sibling of its parent. If the operation results in a parent with no children,
 * also delete the parent node.
 *
 * Can only operate on the first or last child (this is an invariant)
 *
 * This operation respects the tree data invariants - it expects and returns a
 * valid tree.
 */


var moveChildUp = function moveChildUp(blockMap, key) {
  verifyTree(blockMap);
  var block = blockMap.get(key);
  !(block != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must exist in block map') : invariant(false) : void 0; // if there is no parent, do nothing

  var parentKey = block.getParentKey();

  if (parentKey == null) {
    return blockMap;
  }

  var parent = blockMap.get(parentKey);
  !(parent !== null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'parent must exist in block map') : invariant(false) : void 0;
  var newBlockMap = blockMap;
  var childIndex = parent.getChildKeys().indexOf(key);
  !(childIndex === 0 || childIndex === parent.getChildKeys().count() - 1) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block is not first or last child of its parent') : invariant(false) : void 0; // If it's the first child, move as previous sibling of parent

  if (childIndex === 0) {
    var parentPrevSibling = parent.getPrevSiblingKey();
    newBlockMap = updateSibling(newBlockMap, key, parentKey); // link to parent's previous sibling

    if (parentPrevSibling != null) {
      newBlockMap = updateSibling(newBlockMap, parentPrevSibling, key);
    } // remove as parent's child


    parent = newBlockMap.get(parentKey);
    newBlockMap = newBlockMap.set(parentKey, parent.merge({
      children: parent.getChildKeys().slice(1)
    }));
    parent = newBlockMap.get(parentKey); // remove as previous sibling of parent's children

    if (parent.getChildKeys().count() > 0) {
      var firstChildKey = parent.getChildKeys().first();
      var firstChild = newBlockMap.get(firstChildKey);
      newBlockMap = newBlockMap.set(firstChildKey, firstChild.merge({
        prevSibling: null
      }));
    } // add the node just before its former parent in the block map


    newBlockMap = newBlockMap.takeUntil(function (block) {
      return block.getKey() === parentKey;
    }).concat(Immutable.OrderedMap([[key, newBlockMap.get(key)], [parentKey, newBlockMap.get(parentKey)]])).concat(newBlockMap.skipUntil(function (block) {
      return block.getKey() === key;
    }).slice(1)); // If it's the last child, move as next sibling of parent
  } else if (childIndex === parent.getChildKeys().count() - 1) {
    var parentNextSibling = parent.getNextSiblingKey();
    newBlockMap = updateSibling(newBlockMap, parentKey, key); // link to parent's next sibling

    if (parentNextSibling != null) {
      newBlockMap = updateSibling(newBlockMap, key, parentNextSibling);
    } // remove as parent's child


    parent = newBlockMap.get(parentKey);
    newBlockMap = newBlockMap.set(parentKey, parent.merge({
      children: parent.getChildKeys().slice(0, -1)
    }));
    parent = newBlockMap.get(parentKey); // remove as next sibling of parent's children

    if (parent.getChildKeys().count() > 0) {
      var lastChildKey = parent.getChildKeys().last();
      var lastChild = newBlockMap.get(lastChildKey);
      newBlockMap = newBlockMap.set(lastChildKey, lastChild.merge({
        nextSibling: null
      }));
    }
  } // For both cases, also link to parent's parent


  var grandparentKey = parent.getParentKey();

  if (grandparentKey != null) {
    var grandparentInsertPosition = newBlockMap.get(grandparentKey).getChildKeys().findIndex(function (n) {
      return n === parentKey;
    });
    newBlockMap = updateParentChild(newBlockMap, grandparentKey, key, childIndex === 0 ? grandparentInsertPosition : grandparentInsertPosition + 1);
  } else {
    newBlockMap = newBlockMap.set(key, newBlockMap.get(key).merge({
      parent: null
    }));
  } // Delete parent if it has no children


  parent = newBlockMap.get(parentKey);

  if (parent.getChildKeys().count() === 0) {
    var prevSiblingKey = parent.getPrevSiblingKey();
    var nextSiblingKey = parent.getNextSiblingKey();

    if (prevSiblingKey != null && nextSiblingKey != null) {
      newBlockMap = updateSibling(newBlockMap, prevSiblingKey, nextSiblingKey);
    }

    if (prevSiblingKey == null && nextSiblingKey != null) {
      newBlockMap = newBlockMap.set(nextSiblingKey, newBlockMap.get(nextSiblingKey).merge({
        prevSibling: null
      }));
    }

    if (nextSiblingKey == null && prevSiblingKey != null) {
      newBlockMap = newBlockMap.set(prevSiblingKey, newBlockMap.get(prevSiblingKey).merge({
        nextSibling: null
      }));
    }

    if (grandparentKey != null) {
      var grandparent = newBlockMap.get(grandparentKey);
      var oldChildren = grandparent.getChildKeys();
      newBlockMap = newBlockMap.set(grandparentKey, grandparent.merge({
        children: oldChildren["delete"](oldChildren.indexOf(parentKey))
      }));
    }

    newBlockMap = newBlockMap["delete"](parentKey);
  }

  verifyTree(newBlockMap);
  return newBlockMap;
};
/**
 * This is a utility method to merge two non-leaf blocks into one. The next block's
 * children are added to the provided block & the next block is deleted.
 *
 * This operation respects the tree data invariants - it expects and returns a
 * valid tree.
 */


var mergeBlocks = function mergeBlocks(blockMap, key) {
  verifyTree(blockMap); // current block must be a non-leaf

  var block = blockMap.get(key);
  !(block !== null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must exist in block map') : invariant(false) : void 0;
  !(block.getChildKeys().count() > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must be a non-leaf') : invariant(false) : void 0; // next block must exist & be a non-leaf

  var nextBlockKey = block.getNextSiblingKey();
  !(nextBlockKey != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'block must have a next block') : invariant(false) : void 0;
  var nextBlock = blockMap.get(nextBlockKey);
  !(nextBlock != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'next block must exist in block map') : invariant(false) : void 0;
  !(nextBlock.getChildKeys().count() > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'next block must be a non-leaf') : invariant(false) : void 0;
  var childKeys = block.getChildKeys().concat(nextBlock.getChildKeys());
  var newBlockMap = blockMap.set(key, block.merge({
    nextSibling: nextBlock.getNextSiblingKey(),
    children: childKeys
  }));
  newBlockMap = newBlockMap.merge(Immutable.OrderedMap(childKeys.map(function (k, i) {
    return [k, blockMap.get(k).merge({
      parent: key,
      prevSibling: i - 1 < 0 ? null : childKeys.get(i - 1),
      nextSibling: i + 1 === childKeys.count() ? null : childKeys.get(i + 1)
    })];
  })));
  newBlockMap = newBlockMap["delete"](nextBlockKey);
  var nextNextBlockKey = nextBlock.getNextSiblingKey();

  if (nextNextBlockKey != null) {
    newBlockMap = newBlockMap.set(nextNextBlockKey, blockMap.get(nextNextBlockKey).merge({
      prevSibling: key
    }));
  }

  verifyTree(newBlockMap);
  return newBlockMap;
};

module.exports = {
  updateParentChild: updateParentChild,
  replaceParentChild: replaceParentChild,
  updateSibling: updateSibling,
  createNewParent: createNewParent,
  updateAsSiblingsChild: updateAsSiblingsChild,
  moveChildUp: moveChildUp,
  mergeBlocks: mergeBlocks
};