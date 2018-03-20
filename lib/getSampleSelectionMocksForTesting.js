/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleSelectionMocksForTesting
 */

'use strict';

var CharacterMetadata = require('./CharacterMetadata');
var ContentBlock = require('./ContentBlock');
var ContentState = require('./ContentState');
var EditorState = require('./EditorState');
var Immutable = require('immutable');

var _require = require('./SampleDraftInlineStyle'),
    BOLD = _require.BOLD;

var EMPTY = CharacterMetadata.EMPTY;


var getSampleSelectionMocksForTesting = function getSampleSelectionMocksForTesting() {
  var root = document.createElement('div');
  var contents = document.createElement('div');

  contents.setAttribute('data-contents', 'true');
  root.appendChild(contents);

  var text = ['Washington', 'Jefferson', 'Lincoln', 'Roosevelt', 'Kennedy', 'Obama'];

  var textA = text[0] + text[1];
  var textB = text[2] + text[3];
  var textC = text[4] + text[5];

  var boldChar = CharacterMetadata.create({
    style: BOLD
  });

  var aChars = Immutable.List(Immutable.Repeat(EMPTY, text[0].length).concat(Immutable.Repeat(boldChar, text[1].length)));

  var bChars = Immutable.List(Immutable.Repeat(EMPTY, text[2].length).concat(Immutable.Repeat(boldChar, text[3].length)));

  var cChars = Immutable.List(Immutable.Repeat(EMPTY, text[4].length).concat(Immutable.Repeat(boldChar, text[5].length)));

  var contentBlocks = [new ContentBlock({
    key: 'a',
    type: 'unstyled',
    text: textA,
    characterList: aChars
  }), new ContentBlock({
    key: 'b',
    type: 'unstyled',
    text: textB,
    characterList: bChars
  }), new ContentBlock({
    key: 'c',
    type: 'unstyled',
    text: textC,
    characterList: cChars
  })];

  var contentState = ContentState.createFromBlockArray(contentBlocks);
  var editorState = EditorState.createWithContent(contentState);

  var textNodes = text.map(function (text) {
    return document.createTextNode(text);
  });

  var leafChildren = textNodes.map(function (textNode) {
    var span = document.createElement('span');
    span.appendChild(textNode);
    return span;
  });

  var leafs = ['a-0-0', 'a-0-1', 'b-0-0', 'b-0-1', 'c-0-0', 'c-0-1'].map(function (blockKey, index) {
    var span = document.createElement('span');
    span.setAttribute('data-offset-key', '' + blockKey);
    span.appendChild(leafChildren[index]);
    return span;
  });

  var decorators = ['a-0-0', 'b-0-0', 'c-0-0'].map(function (decoratorKey, index) {
    var span = document.createElement('span');
    span.setAttribute('data-offset-key', '' + decoratorKey);
    span.appendChild(leafs[index * 2]);
    span.appendChild(leafs[index * 2 + 1]);
    return span;
  });

  var blocks = ['a-0-0', 'b-0-0', 'c-0-0'].map(function (blockKey, index) {
    var outerBlockElement = document.createElement('div');
    var innerBlockElement = document.createElement('div');

    innerBlockElement.setAttribute('data-offset-key', '' + blockKey);
    innerBlockElement.appendChild(decorators[index]);

    outerBlockElement.setAttribute('data-offset-key', '' + blockKey);
    outerBlockElement.setAttribute('data-block', 'true');
    outerBlockElement.appendChild(innerBlockElement);

    return outerBlockElement;
  });

  blocks.forEach(function (blockElem) {
    contents.appendChild(blockElem);
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

module.exports = getSampleSelectionMocksForTesting;