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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ContentBlock = require("./ContentBlock");

var ContentBlockNode = require("./ContentBlockNode");

var ContentState = require("./ContentState");

var DraftTreeAdapter = require("./DraftTreeAdapter");

var DraftTreeInvariants = require("./DraftTreeInvariants");

var SelectionState = require("./SelectionState");

var createCharacterList = require("./createCharacterList");

var decodeEntityRanges = require("./decodeEntityRanges");

var decodeInlineStyleRanges = require("./decodeInlineStyleRanges");

var generateRandomKey = require("./generateRandomKey");

var gkx = require("./gkx");

var Immutable = require("immutable");

var invariant = require("fbjs/lib/invariant");

var experimentalTreeDataSupport = gkx('draft_tree_data_support');
var List = Immutable.List,
    Map = Immutable.Map,
    OrderedMap = Immutable.OrderedMap;

var decodeBlockNodeConfig = function decodeBlockNodeConfig(block, entityKeyMap) {
  var key = block.key,
      type = block.type,
      data = block.data,
      text = block.text,
      depth = block.depth;
  var blockNodeConfig = {
    text: text,
    depth: depth || 0,
    type: type || 'unstyled',
    key: key || generateRandomKey(),
    data: Map(data),
    characterList: decodeCharacterList(block, entityKeyMap)
  };
  return blockNodeConfig;
};

var decodeCharacterList = function decodeCharacterList(block, entityKeyMap) {
  var text = block.text,
      rawEntityRanges = block.entityRanges,
      rawInlineStyleRanges = block.inlineStyleRanges;
  var entityRanges = rawEntityRanges || [];
  var inlineStyleRanges = rawInlineStyleRanges || []; // Translate entity range keys to the DraftEntity map.

  return createCharacterList(decodeInlineStyleRanges(text, inlineStyleRanges), decodeEntityRanges(text, entityRanges.filter(function (range) {
    return entityKeyMap.hasOwnProperty(range.key);
  }).map(function (range) {
    return _objectSpread(_objectSpread({}, range), {}, {
      key: range.key
    });
  })));
};

var addKeyIfMissing = function addKeyIfMissing(block) {
  return _objectSpread(_objectSpread({}, block), {}, {
    key: block.key || generateRandomKey()
  });
};
/**
 * Node stack is responsible to ensure we traverse the tree only once
 * in depth order, while also providing parent refs to inner nodes to
 * construct their links.
 */


var updateNodeStack = function updateNodeStack(stack, nodes, parentRef) {
  var nodesWithParentRef = nodes.map(function (block) {
    return _objectSpread(_objectSpread({}, block), {}, {
      parentRef: parentRef
    });
  }); // since we pop nodes from the stack we need to insert them in reverse

  return stack.concat(nodesWithParentRef.reverse());
};
/**
 * This will build a tree draft content state by creating the node
 * reference links into a single tree walk. Each node has a link
 * reference to "parent", "children", "nextSibling" and "prevSibling"
 * blockMap will be created using depth ordering.
 */


var decodeContentBlockNodes = function decodeContentBlockNodes(blocks, entityMap) {
  return blocks // ensure children have valid keys to enable sibling links
  .map(addKeyIfMissing).reduce(function (blockMap, block, index) {
    !Array.isArray(block.children) ? process.env.NODE_ENV !== "production" ? invariant(false, 'invalid RawDraftContentBlock can not be converted to ContentBlockNode') : invariant(false) : void 0; // ensure children have valid keys to enable sibling links

    var children = block.children.map(addKeyIfMissing); // root level nodes

    var contentBlockNode = new ContentBlockNode(_objectSpread(_objectSpread({}, decodeBlockNodeConfig(block, entityMap)), {}, {
      prevSibling: index === 0 ? null : blocks[index - 1].key,
      nextSibling: index === blocks.length - 1 ? null : blocks[index + 1].key,
      children: List(children.map(function (child) {
        return child.key;
      }))
    })); // push root node to blockMap

    blockMap = blockMap.set(contentBlockNode.getKey(), contentBlockNode); // this stack is used to ensure we visit all nodes respecting depth ordering

    var stack = updateNodeStack([], children, contentBlockNode); // start computing children nodes

    while (stack.length > 0) {
      // we pop from the stack and start processing this node
      var node = stack.pop(); // parentRef already points to a converted ContentBlockNode

      var parentRef = node.parentRef;
      var siblings = parentRef.getChildKeys();

      var _index = siblings.indexOf(node.key);

      var isValidBlock = Array.isArray(node.children);

      if (!isValidBlock) {
        !isValidBlock ? process.env.NODE_ENV !== "production" ? invariant(false, 'invalid RawDraftContentBlock can not be converted to ContentBlockNode') : invariant(false) : void 0;
        break;
      } // ensure children have valid keys to enable sibling links


      var _children = node.children.map(addKeyIfMissing);

      var _contentBlockNode = new ContentBlockNode(_objectSpread(_objectSpread({}, decodeBlockNodeConfig(node, entityMap)), {}, {
        parent: parentRef.getKey(),
        children: List(_children.map(function (child) {
          return child.key;
        })),
        prevSibling: _index === 0 ? null : siblings.get(_index - 1),
        nextSibling: _index === siblings.size - 1 ? null : siblings.get(_index + 1)
      })); // push node to blockMap


      blockMap = blockMap.set(_contentBlockNode.getKey(), _contentBlockNode); // this stack is used to ensure we visit all nodes respecting depth ordering

      stack = updateNodeStack(stack, _children, _contentBlockNode);
    }

    return blockMap;
  }, OrderedMap());
};

var decodeContentBlocks = function decodeContentBlocks(blocks, entityKeyMap) {
  return OrderedMap(blocks.map(function (block) {
    var contentBlock = new ContentBlock(decodeBlockNodeConfig(block, entityKeyMap));
    return [contentBlock.getKey(), contentBlock];
  }));
};

var decodeRawBlocks = function decodeRawBlocks(rawState, entityKeyMap) {
  var isTreeRawBlock = rawState.blocks.find(function (block) {
    return Array.isArray(block.children) && block.children.length > 0;
  });
  var rawBlocks = experimentalTreeDataSupport && !isTreeRawBlock ? DraftTreeAdapter.fromRawStateToRawTreeState(rawState).blocks : rawState.blocks;

  if (!experimentalTreeDataSupport) {
    return decodeContentBlocks(isTreeRawBlock ? DraftTreeAdapter.fromRawTreeStateToRawState(rawState).blocks : rawBlocks, entityKeyMap);
  }

  var blockMap = decodeContentBlockNodes(rawBlocks, entityKeyMap); // in dev mode, check that the tree invariants are met

  if (process.env.NODE_ENV !== "production") {
    !DraftTreeInvariants.isValidTree(blockMap) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Should be a valid tree') : invariant(false) : void 0;
  }

  return blockMap;
};

var decodeRawEntityMap = function decodeRawEntityMap(contentStateArg, rawState) {
  var rawEntityMap = rawState.entityMap;
  var entityKeyMap = {};
  var contentState = contentStateArg;
  Object.keys(rawEntityMap).forEach(function (rawEntityKey) {
    var _rawEntityMap$rawEnti = rawEntityMap[rawEntityKey],
        type = _rawEntityMap$rawEnti.type,
        mutability = _rawEntityMap$rawEnti.mutability,
        data = _rawEntityMap$rawEnti.data;
    contentState = contentState.createEntity(type, mutability, data || {}, rawEntityKey); // get the key reference to created entity

    entityKeyMap[rawEntityKey] = rawEntityKey;
  });
  return {
    entityKeyMap: entityKeyMap,
    contentState: contentState
  };
};

var convertFromRawToDraftState = function convertFromRawToDraftState(rawState) {
  !Array.isArray(rawState.blocks) ? process.env.NODE_ENV !== "production" ? invariant(false, 'invalid RawDraftContentState') : invariant(false) : void 0; // decode entities

  var _decodeRawEntityMap = decodeRawEntityMap(ContentState.createFromText(''), rawState),
      contentState = _decodeRawEntityMap.contentState,
      entityKeyMap = _decodeRawEntityMap.entityKeyMap; // decode blockMap


  var blockMap = decodeRawBlocks(rawState, entityKeyMap); // create initial selection

  var selectionState = blockMap.isEmpty() ? new SelectionState() : SelectionState.createEmpty(blockMap.first().getKey());
  return new ContentState({
    blockMap: blockMap,
    entityMap: contentState.getEntityMap(),
    selectionBefore: selectionState,
    selectionAfter: selectionState
  });
};

module.exports = convertFromRawToDraftState;