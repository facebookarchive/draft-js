/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 * @format
 */

'use strict';

jest.disableAutomock();

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const Immutable = require('immutable');
const {BOLD} = require('SampleDraftInlineStyle');
const {EMPTY} = CharacterMetadata;

const getDraftEditorSelection = require('getDraftEditorSelection');

let editorState;
let root;
let contents;
let blocks;
let decorators;
let leafs;
let leafChildren;
let textNodes;

const assertGetDraftEditorSelection = getSelectionReturnValue => {
  window.getSelection.mockReturnValueOnce(getSelectionReturnValue);
  const selection = getDraftEditorSelection(editorState, root);
  expect({
    ...selection,
    selectionState: selection.selectionState.toJS(),
  }).toMatchSnapshot();
};

beforeEach(() => {
  window.getSelection = jest.fn();
  root = document.createElement('div');
  contents = document.createElement('div');
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

  const boldChar = CharacterMetadata.create({style: BOLD});
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
  editorState = EditorState.createWithContent(contentState);

  textNodes = text.map(function(text) {
    return document.createTextNode(text);
  });
  leafChildren = textNodes.map(function(textNode) {
    const span = document.createElement('span');
    span.appendChild(textNode);
    return span;
  });
  leafs = ['a-0-0', 'a-0-1', 'b-0-0', 'b-0-1', 'c-0-0', 'c-0-1'].map(function(
    blockKey,
    ii,
  ) {
    const span = document.createElement('span');
    span.setAttribute('data-offset-key', '' + blockKey);
    span.appendChild(leafChildren[ii]);
    return span;
  });
  decorators = ['a-0-0', 'b-0-0', 'c-0-0'].map(function(decoratorKey, ii) {
    const span = document.createElement('span');
    // Decorators may not have `data-offset-key` attribute
    span.setAttribute('decorator-key', '' + decoratorKey);
    span.appendChild(leafs[ii * 2]);
    span.appendChild(leafs[ii * 2 + 1]);
    return span;
  });
  blocks = ['a-0-0', 'b-0-0', 'c-0-0'].map(function(blockKey, ii) {
    const blockElement = document.createElement('div');
    blockElement.setAttribute('data-offset-key', '' + blockKey);
    blockElement.appendChild(decorators[ii]);
    return blockElement;
  });
  blocks.forEach(function(blockElem) {
    contents.appendChild(blockElem);
  });

  document.selection = null;
});

/**
 * Test possible selection states for the text editor. This is based on
 * far too many hours of manual testing and bug fixes, and still may not be
 * a completely accurate representation of all subtle and bizarre differences
 * in implementations and APIs across browsers and operating systems.
 *
 * Welcome to the jungle.
 */
test('must find offsets when collapsed at start', () => {
  const textNode = textNodes[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 0,
    focusNode: textNode,
    focusOffset: 0,
  });
});

test('must find offsets when collapsed at end', () => {
  const textNode = textNodes[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: textNode.length,
    focusNode: textNode,
    focusOffset: textNode.length,
  });
});

test('must find offsets for non-collapsed selection', () => {
  const textNode = textNodes[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 1,
    focusNode: textNode,
    focusOffset: 6,
  });
});

test('must find offsets for reversed selection', () => {
  const textNode = textNodes[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 6,
    focusNode: textNode,
    focusOffset: 1,
  });
});

test('must find offsets for selection on entire text node', () => {
  const textNode = textNodes[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 0,
    focusNode: textNode,
    focusOffset: textNode.length,
  });
});

test('starts at head of one node and ends at head of another', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: textNodes[4],
    focusOffset: 0,
  });
});

test('extends from head of one node to end of another', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: textNodes[2],
    focusOffset: textNodes[2].textContent.length,
  });
});

test('starts within one text node and ends within another block', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 4,
    focusNode: textNodes[4],
    focusOffset: 6,
  });
});

test('is a reversed selection across multiple text nodes', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[4],
    anchorOffset: 4,
    focusNode: textNodes[0],
    focusOffset: 6,
  });
});

// I'm not even certain this is possible, but let's handle it anyway.
test('starts at head of text node, ends at head of leaf child', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: leafChildren[4],
    focusOffset: 0,
  });
});

test('starts at head of text node, ends at end of leaf child', () => {
  const leaf = leafChildren[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('starts within text node, ends at start of leaf child', () => {
  const leaf = leafChildren[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 4,
    focusNode: leaf,
    focusOffset: 0,
  });
});

test('starts within text node, ends at end of leaf child', () => {
  const leaf = leafChildren[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 4,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('is a reversed text-to-leaf-child selection', () => {
  const leaf = leafChildren[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: 0,
    focusNode: textNodes[0],
    focusOffset: 4,
  });
});

test('starts at head of text node, ends at head of leaf span', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: leafs[4],
    focusOffset: 0,
  });
});

test('starts at head of text node, ends at end of leaf span', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('starts within text node, ends at start of leaf span', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 4,
    focusNode: leaf,
    focusOffset: 0,
  });
});

test('starts within text node, ends at end of leaf span', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 4,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('is a reversed text-to-leaf selection', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: 0,
    focusNode: textNodes[0],
    focusOffset: 4,
  });
});

test('is collapsed at start of single span', () => {
  const leaf = leafs[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: 0,
    focusNode: leaf,
    focusOffset: 0,
  });
});

test('is collapsed at end of single span', () => {
  const leaf = leafs[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: leaf.childNodes.length,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('contains an entire leaf', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: 0,
    focusNode: leaf,
    focusOffset: leaf.childNodes.length,
  });
});

test('is reversed on entire leaf', () => {
  const leaf = leafs[4];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leaf,
    anchorOffset: leaf.childNodes.length,
    focusNode: leaf,
    focusOffset: 0,
  });
});

test('from start of one block to start of another', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leafs[0],
    anchorOffset: 0,
    focusNode: leafs[4],
    focusOffset: 0,
  });
});

test('from start of one block to end of other block', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leafs[0],
    anchorOffset: 0,
    focusNode: leafs[4],
    focusOffset: leafs[4].childNodes.length,
  });
});

test('reversed leaf to leaf', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: leafs[4],
    anchorOffset: leafs[4].childNodes.length,
    focusNode: leafs[0],
    focusOffset: 0,
  });
});

test('is collapsed at start at single block', () => {
  const block = blocks[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: block,
    anchorOffset: 0,
    focusNode: block,
    focusOffset: 0,
  });
});

test('is collapsed at end at single block', () => {
  const block = blocks[0];
  const decorators = block.childNodes;
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: block,
    anchorOffset: decorators.length,
    focusNode: block,
    focusOffset: decorators.length,
  });
});

test('is entirely selected', () => {
  const block = blocks[0];
  const decorators = block.childNodes;
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: block,
    anchorOffset: 0,
    focusNode: block,
    focusOffset: decorators.length,
  });
});

/**
 * FF: Triple-clicking a block leads to an entire block being selected,
 * with the first text node as the anchor (0 offset) and the block element
 * as the focus (childNodes.length offset)
 */
test('begins at text node zero, ends at end of block', () => {
  const textNode = textNodes[0];
  const block = blocks[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 0,
    focusNode: block,
    focusOffset: block.childNodes.length,
  });
});

// No idea if this is possible.
test('begins within text node, ends at end of block', () => {
  const textNode = textNodes[0];
  const block = blocks[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNode,
    anchorOffset: 5,
    focusNode: block,
    focusOffset: block.childNodes.length,
  });
});

// No idea if this is possible.
test('is reversed from the first case', () => {
  const textNode = textNodes[0];
  const block = blocks[0];
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: block,
    anchorOffset: block.childNodes.length,
    focusNode: textNode,
    focusOffset: 0,
  });
});

test('goes from start of one block to end of other block', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: blocks[0],
    anchorOffset: 0,
    focusNode: blocks[2],
    focusOffset: blocks[2].childNodes.length,
  });
});

test('goes from start of one block to start of other', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: blocks[0],
    anchorOffset: 0,
    focusNode: blocks[2],
    focusOffset: 0,
  });
});

test('goes from end of one to end of other block', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: blocks[0],
    anchorOffset: blocks[0].childNodes.length,
    focusNode: blocks[2],
    focusOffset: blocks[2].childNodes.length,
  });
});

test('goes from within one block to within another block', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: blocks[0],
    anchorOffset: 1,
    focusNode: blocks[2].firstChild,
    focusOffset: 1,
  });
});

test('is the same as above but reversed', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: blocks[2].firstChild,
    anchorOffset: 1,
    focusNode: blocks[0],
    focusOffset: 1,
  });
});

test('is collapsed at the start of the contents', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: contents,
    anchorOffset: 0,
    focusNode: contents,
    focusOffset: 0,
  });
});

test('occupies a single child of the contents', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: contents,
    anchorOffset: 0,
    focusNode: contents,
    focusOffset: 1,
  });
});

test('is collapsed at the end of a child', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: contents,
    anchorOffset: 1,
    focusNode: contents,
    focusOffset: 1,
  });
});

test('is contains multiple children', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: contents,
    anchorOffset: 0,
    focusNode: contents,
    focusOffset: 3,
  });
});

/**
 * In some scenarios, the entire editor may be selected by command-A.
 */
test('is collapsed at start with full selection', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: root,
    anchorOffset: 0,
    focusNode: root,
    focusOffset: 0,
  });
});

test('is collapsed at end with full selection', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: root,
    anchorOffset: root.childNodes.length,
    focusNode: root,
    focusOffset: root.childNodes.length,
  });
});

test('is completely selected', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: root,
    anchorOffset: 0,
    focusNode: root,
    focusOffset: root.childNodes.length,
  });
});

test('is reversed from above', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: root,
    anchorOffset: root.childNodes.length,
    focusNode: root,
    focusOffset: 0,
  });
});

/**
 * A selection possibility that defies logic. In IE11, triple clicking a
 * block leads to the text node being selected as the anchor, and the
 * **entire editor** being selected as the focus. Ludicrous.
 */
test('does the crazy stuff described above', () => {
  assertGetDraftEditorSelection({
    rangeCount: 1,
    anchorNode: textNodes[0],
    anchorOffset: 0,
    focusNode: root,
    focusOffset: root.childNodes.length,
  });
});
