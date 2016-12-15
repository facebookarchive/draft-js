/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var CharacterMetadata = require('CharacterMetadata');
var ContentBlock = require('ContentBlock');
var ContentState = require('ContentState');
var EditorState = require('EditorState');
var Immutable = require('immutable');
var SelectionState = require('SelectionState');
var RichTextEditorUtil = require('RichTextEditorUtil');

var {
  NONE,
  BOLD,
  ITALIC,
} = require('SampleDraftInlineStyle');

var {EMPTY} = CharacterMetadata;

var {
  List,
  Repeat,
} = Immutable;

var plainBlock = new ContentBlock({
  key: 'a',
  text: 'Arsenal',
  characterList: List(Repeat(EMPTY, 7)),
});

var boldChar = CharacterMetadata.create({style: BOLD});
var boldBlock = new ContentBlock({
  key: 'b',
  text: 'Burnley',
  characterList: List(Repeat(boldChar, 7)),
});

var emptyBlockA = new ContentBlock({
  key: 'emptyA',
  text: '',
  characterList: List(),
});

var emptyBlockB = new ContentBlock({
  key: 'emptyB',
  text: '',
  characterList: List(),
});

var italicChar = CharacterMetadata.create({style: ITALIC});
var italicBlock = new ContentBlock({
  key: 'c',
  text: 'Chelsea',
  characterList: List(Repeat(italicChar, 7)),
});

function getUndecoratedEditorState() {
  var contentState = ContentState.createFromBlockArray([
    plainBlock,
    boldBlock,
    emptyBlockA,
    emptyBlockB,
    italicBlock,
  ]);
  return EditorState.createWithContent(contentState);
}

function getEmptyLedMultiBlockEditorState() {
  var contentState = ContentState.createFromBlockArray([
    emptyBlockA,
    emptyBlockB,
    boldBlock,
  ]);
  return EditorState.createWithContent(contentState);
}

function getDecoratedEditorState(decorator) {
  var contentState = ContentState.createFromBlockArray([
    boldBlock,
    italicBlock,
  ]);
  return EditorState.createWithContent(contentState, decorator);
}

describe('EditorState', () => {

  describe('getCurrentInlineStyle', () => {
    var mainEditor = getUndecoratedEditorState();

    describe('Collapsed selection', () => {
      var mainSelection = new SelectionState({
        anchorKey: 'a',
        anchorOffset: 0,
        focusKey: 'a',
        focusOffset: 0,
        isBackward: false,
      });

      it('uses right of the caret at document start', () => {
        var editor = EditorState.acceptSelection(mainEditor, mainSelection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses left of the caret, at position `1+`', () => {
        var selection = mainSelection.merge({
          anchorOffset: 1,
          focusOffset: 1,
        });
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses right of the caret at offset `0` within document', () => {
        var selection = mainSelection.merge({
          anchorKey: 'b',
          focusKey: 'b',
        });
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('uses previous block at offset `0` within empty block', () => {
        var selection = mainSelection.merge({
          anchorKey: 'emptyA',
          focusKey: 'emptyA',
        });
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('looks upward through empty blocks to find a character', () => {
        var selection = mainSelection.merge({
          anchorKey: 'emptyB',
          focusKey: 'emptyB',
        });
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('does not discard style override when changing block type', () => {
        var editor = EditorState.createEmpty();

        editor = RichTextEditorUtil.toggleInlineStyle(editor, 'BOLD');
        expect(editor.getCurrentInlineStyle().toJS()).toEqual(['BOLD']);

        editor = RichTextEditorUtil.toggleBlockType(editor, 'test-block');
        expect(editor.getCurrentInlineStyle().toJS()).toEqual(['BOLD']);
      });
    });

    describe('Non-collapsed selection', () => {
      var selectionState = new SelectionState({
        anchorKey: 'a',
        anchorOffset: 0,
        focusKey: 'a',
        focusOffset: 1,
        isBackward: false,
      });

      it('uses right of the start for blocks with text', () => {
        var selection = selectionState.set('focusKey', 'b');
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses left of the start if starting at end of block', () => {
        var blockB = mainEditor.getCurrentContent().getBlockForKey('b');
        var selection = selectionState.merge({
          anchorKey: 'b',
          anchorOffset: blockB.getLength(),
          focusKey: 'c',
          focusOffset: 3,
        });

        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('looks upward through empty blocks to find a character', () => {
        var selection = selectionState.merge({
          anchorKey: 'emptyA',
          anchorOffset: 0,
          focusKey: 'c',
          focusOffset: 3,
        });
        var editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('falls back to no style if in empty block at document start', () => {
        var editor = getEmptyLedMultiBlockEditorState(
          new SelectionState({
            anchorKey: 'emptyA',
            anchorOffset: 0,
            focusKey: 'c',
            focusOffset: 3,
            isBackward: false,
          })
        );
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });
    });
  });

  describe('Decorator handling', () => {
    var boldA = List(Repeat('x', boldBlock.getLength()));
    var boldB = List(Repeat('y', boldBlock.getLength()));

    function Decorator() {}
    Decorator.prototype.getDecorations = jest.fn();

    function NextDecorator() {}
    NextDecorator.prototype.getDecorations = jest.fn();

    beforeEach(() => {
      Decorator.prototype.getDecorations.mockClear();
      Decorator.prototype.getDecorations.mockImplementation((v, c) => {
        return v === boldBlock ? boldA : List(Repeat(undefined, v.getLength()));
      });
    });

    it('must set a new decorator', () => {
      var decorator = new Decorator();
      var editorState = getDecoratedEditorState(decorator);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);

      Decorator.prototype.getDecorations.mockImplementation((v, c) => {
        return v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()));
      });
      var newDecorator = new NextDecorator();
      NextDecorator.prototype.getDecorations.mockImplementation((v, c) => {
        return v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()));
      });

      var withNewDecorator = EditorState.set(editorState, {
        decorator: newDecorator,
      });
      expect(withNewDecorator).not.toBe(editorState);

      // Twice for the initial tree map generation, then twice more for
      // filter comparison.
      expect(decorator.getDecorations.mock.calls.length).toBe(4);

      // Twice for filter comparison, once for tree generation since one
      // block has the same decoration list and is filtered out.
      expect(newDecorator.getDecorations.mock.calls.length).toBe(3);

      expect(withNewDecorator.getDecorator()).toBe(newDecorator);

      // Preserve block trees that had the same decorator list.
      expect(
        editorState.getBlockTree(boldBlock.getKey())
      ).toBe(
        withNewDecorator.getBlockTree(boldBlock.getKey())
      );

      expect(
        editorState.getBlockTree(italicBlock.getKey())
      ).not.toBe(
        withNewDecorator.getBlockTree(italicBlock.getKey())
      );
    });

    it('must correctly remove a decorator', () => {
      var decorator = new Decorator();
      var editorState = getDecoratedEditorState(decorator);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);
      var withNewDecorator = EditorState.set(editorState, {decorator: null});
      expect(withNewDecorator).not.toBe(editorState);
      expect(withNewDecorator.getDecorator()).toBe(null);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);
    });
  });
});
