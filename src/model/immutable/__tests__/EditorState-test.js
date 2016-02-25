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

jest.autoMockOff();

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const Immutable = require('immutable');
const SelectionState = require('SelectionState');

const {
  NONE,
  BOLD,
  ITALIC,
} = require('SampleDraftInlineStyle');

const {EMPTY} = CharacterMetadata;

const {
  List,
  Repeat,
} = Immutable;

const plainBlock = new ContentBlock({
  key: 'a',
  text: 'Arsenal',
  characterList: List(Repeat(EMPTY, 7)),
});

const boldChar = CharacterMetadata.create({style: BOLD});
const boldBlock = new ContentBlock({
  key: 'b',
  text: 'Burnley',
  characterList: List(Repeat(boldChar, 7)),
});

const emptyBlockA = new ContentBlock({
  key: 'emptyA',
  text: '',
  characterList: List(),
});

const emptyBlockB = new ContentBlock({
  key: 'emptyB',
  text: '',
  characterList: List(),
});

const italicChar = CharacterMetadata.create({style: ITALIC});
const italicBlock = new ContentBlock({
  key: 'c',
  text: 'Chelsea',
  characterList: List(Repeat(italicChar, 7)),
});

function getUndecoratedEditorState() {
  const contentState = ContentState.createFromBlockArray([
    plainBlock,
    boldBlock,
    emptyBlockA,
    emptyBlockB,
    italicBlock,
  ]);
  return EditorState.createWithContent(contentState);
}

function getEmptyLedMultiBlockEditorState() {
  const contentState = ContentState.createFromBlockArray([
    emptyBlockA,
    emptyBlockB,
    boldBlock,
  ]);
  return EditorState.createWithContent(contentState);
}

function getDecoratedEditorState(decorator) {
  const contentState = ContentState.createFromBlockArray([
    boldBlock,
    italicBlock,
  ]);
  return EditorState.createWithContent(contentState, decorator);
}

describe('EditorState', () => {

  describe('getCurrentInlineStyle', () => {
    const mainEditor = getUndecoratedEditorState();

    describe('Collapsed selection', () => {
      const mainSelection = new SelectionState({
        anchorKey: 'a',
        anchorOffset: 0,
        focusKey: 'a',
        focusOffset: 0,
        isBackward: false,
      });

      it('uses right of the caret at document start', () => {
        const editor = EditorState.acceptSelection(mainEditor, mainSelection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses left of the caret, at position `1+`', () => {
        const selection = mainSelection.merge({
          anchorOffset: 1,
          focusOffset: 1,
        });
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses right of the caret at offset `0` within document', () => {
        const selection = mainSelection.merge({
          anchorKey: 'b',
          focusKey: 'b',
        });
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('uses previous block at offset `0` within empty block', () => {
        const selection = mainSelection.merge({
          anchorKey: 'emptyA',
          focusKey: 'emptyA',
        });
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('looks upward through empty blocks to find a character', () => {
        const selection = mainSelection.merge({
          anchorKey: 'emptyB',
          focusKey: 'emptyB',
        });
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });
    });

    describe('Non-collapsed selection', () => {
      const selectionState = new SelectionState({
        anchorKey: 'a',
        anchorOffset: 0,
        focusKey: 'a',
        focusOffset: 1,
        isBackward: false,
      });

      it('uses right of the start for blocks with text', () => {
        const selection = selectionState.set('focusKey', 'b');
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(NONE);
      });

      it('uses left of the start if starting at end of block', () => {
        const blockB = mainEditor.getCurrentContent().getBlockForKey('b');
        const selection = selectionState.merge({
          anchorKey: 'b',
          anchorOffset: blockB.getLength(),
          focusKey: 'c',
          focusOffset: 3,
        });

        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('looks upward through empty blocks to find a character', () => {
        const selection = selectionState.merge({
          anchorKey: 'emptyA',
          anchorOffset: 0,
          focusKey: 'c',
          focusOffset: 3,
        });
        const editor = EditorState.acceptSelection(mainEditor, selection);
        expect(editor.getCurrentInlineStyle()).toBe(BOLD);
      });

      it('falls back to no style if in empty block at document start', () => {
        const editor = getEmptyLedMultiBlockEditorState(
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
    const boldA = List(Repeat('x', boldBlock.getLength()));
    const boldB = List(Repeat('y', boldBlock.getLength()));

    function Decorator() {}
    Decorator.prototype.getDecorations = jest.genMockFn();

    function NextDecorator() {}
    NextDecorator.prototype.getDecorations = jest.genMockFn();

    beforeEach(() => {
      Decorator.prototype.getDecorations.mockClear();
      Decorator.prototype.getDecorations.mockImplementation(
        v => v === boldBlock ? boldA : List(Repeat(undefined, v.getLength()))
      );
    });

    it('must set a new decorator', () => {
      const decorator = new Decorator();
      const editorState = getDecoratedEditorState(decorator);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);

      Decorator.prototype.getDecorations.mockImplementation(
        v => v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()))
      );
      const newDecorator = new NextDecorator();
      NextDecorator.prototype.getDecorations.mockImplementation(
        v => v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()))
      );

      const withNewDecorator = EditorState.set(editorState, {
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
      const decorator = new Decorator();
      const editorState = getDecoratedEditorState(decorator);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);
      const withNewDecorator = EditorState.set(editorState, {decorator: null});
      expect(withNewDecorator).not.toBe(editorState);
      expect(withNewDecorator.getDecorator()).toBe(null);
      expect(decorator.getDecorations.mock.calls.length).toBe(2);
    });
  });
});
