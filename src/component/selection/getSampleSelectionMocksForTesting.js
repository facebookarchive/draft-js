/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getSampleSelectionMocksForTesting
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

function getSampleSelectionMocksForTesting() {
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
    'Jefferson',
    'Lincoln',
    'Roosevelt',
    'Kennedy',
    'Obama',
  ];

  var textA = text[0] + text[1];
  var textB = text[2] + text[3];
  var textC = text[4] + text[5];

  var boldChar = CharacterMetadata.create({
    style: BOLD
  });
  var aChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[0].length).concat(
      Immutable.Repeat(boldChar, text[1].length)
    )
  );
  var bChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[2].length).concat(
      Immutable.Repeat(boldChar, text[3].length)
    )
  );
  var cChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[4].length).concat(
      Immutable.Repeat(boldChar, text[5].length)
    )
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
      key: 'c',
      type: 'unstyled',
      text: textC,
      characterList: cChars,
    }),
  ];

  var contentState = ContentState.createFromBlockArray(contentBlocks);
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
  leafs = ['a-0-0', 'a-0-1', 'b-0-0', 'b-0-1', 'c-0-0', 'c-0-1']
    .map(
      function(blockKey, ii) {
        var span = document.createElement('span');
        span.setAttribute('data-offset-key', '' + blockKey);
        span.appendChild(leafChildren[ii]);
        return span;
      }
    );
  decorators = ['a-0-0', 'b-0-0', 'c-0-0']
    .map(
      function(decoratorKey, ii) {
        var span = document.createElement('span');
        span.setAttribute('data-offset-key', '' + decoratorKey);
        span.appendChild(leafs[(ii * 2)]);
        span.appendChild(leafs[(ii * 2) + 1]);
        return span;
      }
    );
  blocks = ['a-0-0', 'b-0-0', 'c-0-0']
    .map(
      function(blockKey, ii) {
        var blockElement = document.createElement('div');
        blockElement.setAttribute('data-offset-key', '' + blockKey);
        blockElement.appendChild(decorators[ii]);
        return blockElement;
      }
    );
  blocks.forEach(
    function(blockElem) {
      contents.appendChild(blockElem);
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

module.exports = getSampleSelectionMocksForTesting;
