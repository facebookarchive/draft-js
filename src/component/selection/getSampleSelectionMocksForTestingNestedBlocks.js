/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleSelectionMocksForTestingNestedBlocks
 * @typechecks
 * @flow
 */

'use strict';

var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');
var EditorState = require('EditorState');
var Immutable = require('immutable');

var {BOLD} = require('SampleDraftInlineStyle');
var {EMPTY} = CharacterMetadata;

function getSampleSelectionMocksForTestingNestedBlocks() {
  var editorState;
  var root;
  var contents;
  var blocks;
  var decorators;
  var leafs;
  var leafChildren;
  var textNodes;

  root = document.createElement('div');
  contents = document.createElement('div');
  contents.setAttribute('data-contents', 'true');
  root.appendChild(contents);

  var text = [
    'Washington',
    '',
    'Lincoln',
    'Kennedy'
  ];

  var textA = text[0];
  var textB = text[1];
  var textC = text[2];
  var textD = text[3];

  var boldChar = CharacterMetadata.create({
    style: BOLD
  });
  var aChars = Immutable.List(
    Immutable.Repeat(boldChar, text[0].length)
  );
  var bChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[1].length)
  );
  var cChars = Immutable.List(
    Immutable.Repeat(boldChar, text[2].length)
  );
  var dChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[3].length)
  );

  var contentBlocks = [
    new ContentBlock({
      key: 'a',
      type: 'unstyled',
      text: textA,
      characterList: aChars,
    }),
    new ContentBlock({
      key: 'b',
      type: 'unstyled',
      text: textB,
      characterList: bChars,
    }),
    new ContentBlock({
      key: 'b/c',
      type: 'unstyled',
      text: textC,
      characterList: cChars,
    }),
    new ContentBlock({
      key: 'b/d',
      type: 'unstyled',
      text: textD,
      characterList: dChars,
    }),
  ];

  var contentState = ContentState.createFromBlockArray(contentBlocks);
  var blockKeys = contentState.getBlockMap().keySeq();

  editorState = EditorState.createWithContent(contentState);

  textNodes = text
    .map(
      function(text) {
        return document.createTextNode(text);
      }
    );
  leafChildren = textNodes
    .map(
      function(textNode) {
        var span = document.createElement('span');
        span.appendChild(textNode);
        return span;
      }
    );
  leafs = ['a-0-0', 'b-0-0', 'b/c-0-0', 'b/d-0-0']
    .map(
      function(blockKey, ii) {
        var span = document.createElement('span');
        span.setAttribute('data-offset-key', '' + blockKey);
        span.appendChild(leafChildren[ii]);
        return span;
      }
    );
  decorators = ['a-0-0', 'b-0-0', 'b/c-0-0', 'b/d-0-0']
    .map(
      function(decoratorKey, ii) {
        var span = document.createElement('span');
        span.setAttribute('data-offset-key', '' + decoratorKey);
        span.appendChild(leafs[ii]);
        return span;
      }
    );
  blocks = ['a-0-0', 'b-0-0', 'b/c-0-0', 'b/d-0-0']
    .map(
      function(blockKey, ii) {
        var blockElement = document.createElement('div');
        var dataBlock = document.createElement('div');
        blockElement.setAttribute('data-offset-key', '' + blockKey);
        blockElement.appendChild(decorators[ii]);

        dataBlock.setAttribute('data-offset-key', '' + blockKey);
        dataBlock.setAttribute('data-block', 'true');
        dataBlock.appendChild(blockElement);

        return dataBlock;
      }
    );

  blocks.forEach(
    function(blockElem, index, arr) {
      const currentBlock = contentBlocks[index];
      const parentKey = currentBlock.getParentKey();
      const hasChildren = contentState.getBlockChildren(currentBlock.getKey()).size > 0;

      if (hasChildren) { // if a block has children it should not have leafs just a data-blocks container
        const dataBlocks = document.createElement('div');
        dataBlocks.setAttribute('data-blocks', 'true');
        blockElem.firstChild.replaceChild(dataBlocks, blockElem.querySelector('span'));
      }

      if (parentKey) {
        const parentIndex = blockKeys.indexOf(parentKey);
        const parentBlockElement = arr[parentIndex];
        const blockContainer = parentBlockElement.querySelector('div[data-blocks]');

        if (blockContainer) {
          blockContainer.appendChild(blockElem);
        }
      } else {
        contents.appendChild(blockElem);
      }
    }
  );

  return {
    editorState,
    root,
    contents,
    blocks,
    decorators,
    leafs,
    leafChildren,
    textNodes
  };
}

module.exports = getSampleSelectionMocksForTestingNestedBlocks;
