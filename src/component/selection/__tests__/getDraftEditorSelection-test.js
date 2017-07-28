/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');
var EditorState = require('EditorState');
var Immutable = require('immutable');
var {BOLD} = require('SampleDraftInlineStyle');
var SelectionState = require('SelectionState');
var {EMPTY} = CharacterMetadata;

var getDraftEditorSelection = require('getDraftEditorSelection');

/**
 * Test possible selection states for the text editor. This is based on
 * far too many hours of manual testing and bug fixes, and still may not be
 * a completely accurate representation of all subtle and bizarre differences
 * in implementations and APIs across browsers and operating systems.
 *
 * Welcome to the jungle.
 */
describe('getDraftEditorSelection', function() {
  var editorState;
  var root;
  var contents;
  var blocks;
  var decorators;
  var leafs;
  var leafChildren;
  var textNodes;

  beforeEach(function() {
    window.getSelection = jest.fn();
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

    var boldChar = CharacterMetadata.create({style: BOLD});
    var aChars = Immutable.List(
      Immutable.Repeat(EMPTY, text[0].length).concat(
        Immutable.Repeat(boldChar, text[1].length),
      ),
    );
    var bChars = Immutable.List(
      Immutable.Repeat(EMPTY, text[2].length).concat(
        Immutable.Repeat(boldChar, text[3].length),
      ),
    );
    var cChars = Immutable.List(
      Immutable.Repeat(EMPTY, text[4].length).concat(
        Immutable.Repeat(boldChar, text[5].length),
      ),
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
        },
      );
    leafChildren = textNodes
      .map(
        function(textNode) {
          var span = document.createElement('span');
          span.appendChild(textNode);
          return span;
        },
      );
    leafs = ['a-0-0', 'a-0-1', 'b-0-0', 'b-0-1', 'c-0-0', 'c-0-1']
      .map(
        function(blockKey, ii) {
          var span = document.createElement('span');
          span.setAttribute('data-offset-key', '' + blockKey);
          span.appendChild(leafChildren[ii]);
          return span;
        },
      );
    decorators = ['a-0-0', 'b-0-0', 'c-0-0']
      .map(
        function(decoratorKey, ii) {
          var span = document.createElement('span');
          // Decorators may not have `data-offset-key` attribute
          span.setAttribute('decorator-key', '' + decoratorKey);
          span.appendChild(leafs[(ii * 2)]);
          span.appendChild(leafs[(ii * 2) + 1]);
          return span;
        },
      );
    blocks = ['a-0-0', 'b-0-0', 'c-0-0']
      .map(
        function(blockKey, ii) {
          var blockElement = document.createElement('div');
          blockElement.setAttribute('data-offset-key', '' + blockKey);
          blockElement.appendChild(decorators[ii]);
          return blockElement;
        },
      );
    blocks.forEach(
      function(blockElem) {
        contents.appendChild(blockElem);
      },
    );
  });

  function assertEquals(result, assert) {
    var resultSelection = result.selectionState;
    var resultRecovery = result.needsRecovery;
    var assertSelection = assert.selectionState;
    var assertRecovery = assert.needsRecovery;
    expect(resultSelection.getAnchorKey())
      .toBe(assertSelection.getAnchorKey());
    expect(resultSelection.getAnchorOffset())
      .toBe(assertSelection.getAnchorOffset());
    expect(resultSelection.getFocusKey())
      .toBe(assertSelection.getFocusKey());
    expect(resultSelection.getFocusOffset())
      .toBe(assertSelection.getFocusOffset());
    expect(resultSelection.getIsBackward())
      .toBe(assertSelection.getIsBackward());
    expect(resultRecovery).toBe(assertRecovery);
  }

  describe('Modern Selection', function() {
    beforeEach(function() {
      document.selection = null;
    });

    describe('Selection is entirely within a single text node', function() {

      it('must find offsets when collapsed at start', function() {
        var textNode = textNodes[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 0,
          focusNode: textNode,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('must find offsets when collapsed at end', function() {
        var textNode = textNodes[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: textNode.length,
          focusNode: textNode,
          focusOffset: textNode.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: textNode.length,
            focusKey: 'a',
            focusOffset: textNode.length,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('must find offsets for non-collapsed selection', function() {
        var textNode = textNodes[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 1,
          focusNode: textNode,
          focusOffset: 6,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 1,
            focusKey: 'a',
            focusOffset: 6,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('must find offsets for reversed selection', function() {
        var textNode = textNodes[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 6,
          focusNode: textNode,
          focusOffset: 1,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 6,
            focusKey: 'a',
            focusOffset: 1,
            isBackward: true,
          }),
          needsRecovery: false,
        });
      });

      it('must find offsets for selection on entire text node', function() {
        var textNode = textNodes[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 0,
          focusNode: textNode,
          focusOffset: textNode.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: textNode.length,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });
    });

    describe('Selection spans multiple text nodes', function() {

      it('starts at head of one node and ends at head of another', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: textNodes[4],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('extends from head of one node to end of another', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: textNodes[2],
          focusOffset: textNodes[2].textContent.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'b',
            focusOffset: textNodes[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('starts within one text node and ends within another', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 4,
          focusNode: textNodes[4],
          focusOffset: 6,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 4,
            focusKey: 'c',
            focusOffset: 6,
            isBackward: false,
          }),
          needsRecovery: false,
        });
      });

      it('is a reversed selection across multiple text nodes', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[4],
          anchorOffset: 4,
          focusNode: textNodes[0],
          focusOffset: 6,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: 4,
            focusKey: 'a',
            focusOffset: 6,
            isBackward: true,
          }),
          needsRecovery: false,
        });
      });
    });

    // I'm not even certain this is possible, but let's handle it anyway.
    describe('One end is a text node, the other is a leaf child', function() {
      it('starts at head of text node, ends at head of leaf child', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: leafChildren[4],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('starts at head of text node, ends at end of leaf child', function() {
        var leaf = leafChildren[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });


      it('starts within text node, ends at start of leaf child', function() {
        var leaf = leafChildren[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 4,
          focusNode: leaf,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 4,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('starts within text node, ends at end of leaf child', function() {
        var leaf = leafChildren[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 4,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 4,
            focusKey: 'c',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is a reversed text-to-leaf-child selection', function() {
        var leaf = leafChildren[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: 0,
          focusNode: textNodes[0],
          focusOffset: 4,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 4,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('One end is a text node, the other is a leaf span', function() {
      it('starts at head of text node, ends at head of leaf span', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: leafs[4],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('starts at head of text node, ends at end of leaf span', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });


      it('starts within text node, ends at start of leaf span', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 4,
          focusNode: leaf,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 4,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('starts within text node, ends at end of leaf span', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 4,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 4,
            focusKey: 'c',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is a reversed text-to-leaf selection', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: 0,
          focusNode: textNodes[0],
          focusOffset: 4,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 4,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('A single leaf span is selected', function() {
      it('is collapsed at start', function() {
        var leaf = leafs[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: 0,
          focusNode: leaf,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is collapsed at end', function() {
        var leaf = leafs[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: leaf.childNodes.length,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: leaf.textContent.length,
            focusKey: 'a',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });


      it('contains an entire leaf', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: 0,
          focusNode: leaf,
          focusOffset: leaf.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: leaf.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is reversed on entire leaf', function() {
        var leaf = leafs[4];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leaf,
          anchorOffset: leaf.childNodes.length,
          focusNode: leaf,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: leaf.textContent.length,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('Multiple leaf spans are selected', function() {
      it('from start of one to start of another', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leafs[0],
          anchorOffset: 0,
          focusNode: leafs[4],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('from start of one to end of other', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leafs[0],
          anchorOffset: 0,
          focusNode: leafs[4],
          focusOffset: leafs[4].childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: leafs[4].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });


      it('reversed leaf to leaf', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: leafs[4],
          anchorOffset: leafs[4].childNodes.length,
          focusNode: leafs[0],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: leafs[4].textContent.length,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('A single block is selected', function() {
      it('is collapsed at start', function() {
        var block = blocks[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: block,
          anchorOffset: 0,
          focusNode: block,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is collapsed at end', function() {
        var block = blocks[0];
        var decorators = block.childNodes;
        var leafs = decorators[0].childNodes;
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: block,
          anchorOffset: decorators.length,
          focusNode: block,
          focusOffset: decorators.length,
        });

        var textLength = 0;
        for (var ii = 0; ii < leafs.length; ii++) {
          textLength += leafs[ii].textContent.length;
        }

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: textLength,
            focusKey: 'a',
            focusOffset: textLength,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is entirely selected', function() {
        var block = blocks[0];
        var decorators = block.childNodes;
        var leafs = decorators[0].childNodes;
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: block,
          anchorOffset: 0,
          focusNode: block,
          focusOffset: decorators.length,
        });

        var textLength = 0;
        for (var ii = 0; ii < leafs.length; ii++) {
          textLength += leafs[ii].textContent.length;
        }

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: textLength,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });
    });

    /**
     * FF: Triple-clicking a block leads to an entire block being selected,
     * with the first text node as the anchor (0 offset) and the block element
     * as the focus (childNodes.length offset)
     */
    describe('Selection with text node and block', function() {
      it('begins at text node zero, ends at end of block', function() {
        var textNode = textNodes[0];
        var block = blocks[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 0,
          focusNode: block,
          focusOffset: block.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: block.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      // No idea if this is possible.
      it('begins within text node, ends at end of block', function() {
        var textNode = textNodes[0];
        var block = blocks[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNode,
          anchorOffset: 5,
          focusNode: block,
          focusOffset: block.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 5,
            focusKey: 'a',
            focusOffset: block.textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      // No idea if this is possible.
      it('is reversed from the first case', function() {
        var textNode = textNodes[0];
        var block = blocks[0];
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: block,
          anchorOffset: block.childNodes.length,
          focusNode: textNode,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: block.textContent.length,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('Multiple blocks are selected', function() {
      it('goes from start of one to end of other', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: blocks[0],
          anchorOffset: 0,
          focusNode: blocks[2],
          focusOffset: blocks[2].childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('goes from start of one to start of other', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: blocks[0],
          anchorOffset: 0,
          focusNode: blocks[2],
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('goes from end of one to end of other', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: blocks[0],
          anchorOffset: blocks[0].childNodes.length,
          focusNode: blocks[2],
          focusOffset: blocks[2].childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: blocks[0].textContent.length,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('goes from within one to within another', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: blocks[0],
          anchorOffset: 1,
          focusNode: blocks[2].firstChild,
          focusOffset: 1,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: blocks[0].textContent.length,
            focusKey: 'c',
            focusOffset: textNodes[4].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is the same as above but reversed', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: blocks[2].firstChild,
          anchorOffset: 1,
          focusNode: blocks[0],
          focusOffset: 1,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: textNodes[4].textContent.length,
            focusKey: 'a',
            focusOffset: blocks[0].textContent.length,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    describe('The content wrapper is selected', () => {
      it('is collapsed at the start of the contents', () => {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: contents,
          anchorOffset: 0,
          focusNode: contents,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('occupies a single child of the contents', () => {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: contents,
          anchorOffset: 0,
          focusNode: contents,
          focusOffset: 1,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: blocks[0].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is collapsed at the end of a child', () => {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: contents,
          anchorOffset: 1,
          focusNode: contents,
          focusOffset: 1,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: blocks[0].textContent.length,
            focusKey: 'a',
            focusOffset: blocks[0].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is contains multiple children', () => {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: contents,
          anchorOffset: 0,
          focusNode: contents,
          focusOffset: 3,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });
    });

    /**
     * In some scenarios, the entire editor may be selected by command-A.
     */
    describe('The entire editor is selected.', function() {
      it('is collapsed at start', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: root,
          anchorOffset: 0,
          focusNode: root,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is collapsed at end', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: root,
          anchorOffset: root.childNodes.length,
          focusNode: root,
          focusOffset: root.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: blocks[2].textContent.length,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is completely selected', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: root,
          anchorOffset: 0,
          focusNode: root,
          focusOffset: root.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });

      it('is reversed from above', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: root,
          anchorOffset: root.childNodes.length,
          focusNode: root,
          focusOffset: 0,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'c',
            anchorOffset: blocks[2].textContent.length,
            focusKey: 'a',
            focusOffset: 0,
            isBackward: true,
          }),
          needsRecovery: true,
        });
      });
    });

    /**
     * A selection possibility that defies logic. In IE11, triple clicking a
     * block leads to the text node being selected as the anchor, and the
     * **entire editor** being selected as the focus. Ludicrous.
     */
    describe('One end is text node, the other is the whole editor', function() {
      it('does the crazy stuff described above', function() {
        window.getSelection.mockReturnValueOnce({
          rangeCount: 1,
          anchorNode: textNodes[0],
          anchorOffset: 0,
          focusNode: root,
          focusOffset: root.childNodes.length,
        });

        var selection = getDraftEditorSelection(editorState, root);
        assertEquals(selection, {
          selectionState: new SelectionState({
            anchorKey: 'a',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: blocks[2].textContent.length,
            isBackward: false,
          }),
          needsRecovery: true,
        });
      });
    });
  });
});
