/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleSelectionMocksForTestingNestedBlocks
 */

'use strict';

var ContentBlockNode = require('./ContentBlockNode');
var ContentState = require('./ContentState');
var EditorState = require('./EditorState');
var Immutable = require('immutable');

var getSampleSelectionMocksForTestingNestedBlocks = function getSampleSelectionMocksForTestingNestedBlocks() {
  var root = document.createElement('div');
  var contents = document.createElement('div');

  contents.setAttribute('data-contents', 'true');
  root.appendChild(contents);

  var text = [null, 'beta', null, 'delta'];
  var offsetKeys = ['a-0-0', 'b-0-0', 'c-0-0', 'd-0-0'];

  var contentBlocks = [new ContentBlockNode({
    key: 'a',
    nextSibling: 'c',
    children: Immutable.List.of('b')
  }), new ContentBlockNode({
    key: 'b',
    parent: 'a',
    text: text[1]
  }), new ContentBlockNode({
    key: 'c',
    prevSibling: 'a',
    children: Immutable.List.of('d')
  }), new ContentBlockNode({
    key: 'd',
    parent: 'c',
    text: text[3]
  })];

  var contentState = ContentState.createFromBlockArray(contentBlocks);
  var editorState = EditorState.createWithContent(contentState);

  var textNodes = text.map(function (text) {
    if (!text) {
      return null;
    }
    return document.createTextNode(text);
  });

  var leafChildren = textNodes.map(function (textNode) {
    if (!textNode) {
      return null;
    }
    var span = document.createElement('span');
    span.appendChild(textNode);
    return span;
  });

  var leafs = leafChildren.map(function (leafChild, index) {
    if (!leafChild) {
      return null;
    }
    var blockKey = offsetKeys[index];
    var span = document.createElement('span');
    span.setAttribute('data-offset-key', blockKey);
    span.appendChild(leafChild);
    return span;
  });

  var decorators = leafs.map(function (leaf, index) {
    if (!leaf) {
      return null;
    }
    var blockKey = offsetKeys[index];
    var span = document.createElement('span');
    span.setAttribute('data-offset-key', blockKey);
    span.appendChild(leaf);
    return span;
  });

  var blocks = offsetKeys.map(function (blockKey, index) {
    var outerBlockElement = document.createElement('div');
    var innerBlockElement = document.createElement('div');

    innerBlockElement.setAttribute('data-offset-key', blockKey);
    outerBlockElement.setAttribute('data-offset-key', blockKey);
    outerBlockElement.setAttribute('data-block', 'true');

    var decorator = decorators[index];

    // only leaf nodes can have text
    if (decorator) {
      innerBlockElement.appendChild(decorator);
    }

    outerBlockElement.appendChild(innerBlockElement);

    return outerBlockElement;
  });

  var blockCacheRef = {};
  blocks.forEach(function (blockElem, index) {
    var currentBlock = contentBlocks[index];
    var parentKey = currentBlock.getParentKey();

    // add this block reference to the cache lookup ref
    blockCacheRef[currentBlock.getKey()] = blockElem;

    // root nodes get appended directly to the contents block
    if (!parentKey) {
      contents.appendChild(blockElem);
      return;
    }

    // append to to the innerBlockElement of the parent block
    blockCacheRef[parentKey].firstChild.appendChild(blockElem);
  });

  return {
    editorState: editorState,
    root: root,
    contents: contents,
    blocks: blocks,
    decorators: decorators,
    leafs: leafs,
    leafChildren: leafChildren,
    textNodes: textNodes
  };
};

module.exports = getSampleSelectionMocksForTestingNestedBlocks;