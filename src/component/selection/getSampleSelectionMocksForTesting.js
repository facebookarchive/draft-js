/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const {BOLD} = require('SampleDraftInlineStyle');

const Immutable = require('immutable');
const {EMPTY} = CharacterMetadata;

const getSampleSelectionMocksForTesting = (): Object => {
  const root = document.createElement('div');
  const contents = document.createElement('div');

  contents.setAttribute('data-contents', 'true');
  root.appendChild(contents);

  const text = [
    'Washington',
    'Jefferson',
    'Lincoln',
    'Roosevelt',
    'Kennedy',
    'Obama',
  ];

  const textA = text[0] + text[1];
  const textB = text[2] + text[3];
  const textC = text[4] + text[5];

  const boldChar = CharacterMetadata.create({
    style: BOLD,
  });

  const aChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[0].length).concat(
      Immutable.Repeat(boldChar, text[1].length),
    ),
  );

  const bChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[2].length).concat(
      Immutable.Repeat(boldChar, text[3].length),
    ),
  );

  const cChars = Immutable.List(
    Immutable.Repeat(EMPTY, text[4].length).concat(
      Immutable.Repeat(boldChar, text[5].length),
    ),
  );

  const contentBlocks = [
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

  const contentState = ContentState.createFromBlockArray(contentBlocks);
  const editorState = EditorState.createWithContent(contentState);

  const textNodes = text.map(text => {
    return document.createTextNode(text);
  });

  const leafChildren = textNodes.map(textNode => {
    const span = document.createElement('span');
    span.appendChild(textNode);
    return span;
  });

  const leafs = ['a-0-0', 'a-0-1', 'b-0-0', 'b-0-1', 'c-0-0', 'c-0-1'].map(
    (blockKey, index) => {
      const span = document.createElement('span');
      span.setAttribute('data-offset-key', '' + blockKey);
      span.appendChild(leafChildren[index]);
      return span;
    },
  );

  const decorators = ['a-0-0', 'b-0-0', 'c-0-0'].map((decoratorKey, index) => {
    const span = document.createElement('span');
    span.setAttribute('data-offset-key', '' + decoratorKey);
    span.appendChild(leafs[index * 2]);
    span.appendChild(leafs[index * 2 + 1]);
    return span;
  });

  const blocks = ['a-0-0', 'b-0-0', 'c-0-0'].map((blockKey, index) => {
    const outerBlockElement = document.createElement('div');
    const innerBlockElement = document.createElement('div');

    innerBlockElement.setAttribute('data-offset-key', '' + blockKey);
    innerBlockElement.appendChild(decorators[index]);

    outerBlockElement.setAttribute('data-offset-key', '' + blockKey);
    outerBlockElement.setAttribute('data-block', 'true');
    outerBlockElement.appendChild(innerBlockElement);

    return outerBlockElement;
  });

  blocks.forEach(blockElem => {
    contents.appendChild(blockElem);
  });

  return {
    editorState,
    root,
    contents,
    blocks,
    decorators,
    leafs,
    leafChildren,
    textNodes,
  };
};

module.exports = getSampleSelectionMocksForTesting;
