/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const RichTextEditorUtil = require('RichTextEditorUtil');
const {BOLD, ITALIC} = require('SampleDraftInlineStyle');
const SelectionState = require('SelectionState');

const Immutable = require('immutable');

const {List, Repeat} = Immutable;

class Decorator {}
Decorator.prototype.getDecorations = jest.fn();

const DEFAULT_SELECTION = {
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
};

const collapsedSelection = new SelectionState(DEFAULT_SELECTION);
const rangedSelection = new SelectionState({
  ...DEFAULT_SELECTION,
  focusOffset: 1,
});

const plainBlock = new ContentBlock({
  key: 'a',
  text: 'Arsenal',
});
const boldBlock = new ContentBlock({
  key: 'b',
  text: 'Burnley',
  characterList: List(Repeat(CharacterMetadata.create({style: BOLD}), 7)),
});
const boldA = List(Repeat('x', boldBlock.getLength()));
const emptyBlockA = new ContentBlock({
  key: 'emptyA',
  text: '',
});
const emptyBlockB = new ContentBlock({
  key: 'emptyB',
  text: '',
});
const italicBlock = new ContentBlock({
  key: 'c',
  text: 'Chelsea',
  characterList: List(Repeat(CharacterMetadata.create({style: ITALIC}), 7)),
});

const getSampleEditorState = (type, decorator) => {
  switch (type) {
    case 'DECORATED':
      return EditorState.createWithContent(
        ContentState.createFromBlockArray([boldBlock, italicBlock]),
        decorator,
      );
    case 'MULTI_BLOCK':
      return EditorState.createWithContent(
        ContentState.createFromBlockArray([
          emptyBlockA,
          emptyBlockB,
          boldBlock,
        ]),
      );
    case 'UNDECORATED':
    default:
      return EditorState.createWithContent(
        ContentState.createFromBlockArray([
          plainBlock,
          boldBlock,
          emptyBlockA,
          emptyBlockB,
          italicBlock,
        ]),
      );
  }
};

const UNDECORATED_STATE = getSampleEditorState('UNDECORATED');

const MULTI_BLOCK_STATE = getSampleEditorState('MULTI_BLOCK');

const assertGetCurrentInlineStyle = (selection, state = UNDECORATED_STATE) => {
  const editorState = EditorState.acceptSelection(state, selection);
  expect(editorState.getCurrentInlineStyle().toJS()).toMatchSnapshot();
};

beforeEach(() => {
  Decorator.prototype.getDecorations.mockClear();
  Decorator.prototype.getDecorations.mockImplementation((v, c) => {
    return v === boldBlock ? boldA : List(Repeat(undefined, v.getLength()));
  });
});

test('uses right of the caret at document start', () => {
  assertGetCurrentInlineStyle(collapsedSelection);
});

test('uses left of the caret, at position `1+`', () => {
  assertGetCurrentInlineStyle(
    collapsedSelection.merge({
      anchorOffset: 1,
      focusOffset: 1,
    }),
  );
});

test('uses right of the caret at offset `0` within document', () => {
  assertGetCurrentInlineStyle(
    collapsedSelection.merge({
      anchorKey: 'b',
      focusKey: 'b',
    }),
  );
});

test('uses previous block at offset `0` within empty block', () => {
  assertGetCurrentInlineStyle(
    collapsedSelection.merge({
      anchorKey: 'emptyA',
      focusKey: 'emptyA',
    }),
  );
});

test('looks upward through empty blocks to find a character with collapsed selection', () => {
  assertGetCurrentInlineStyle(
    collapsedSelection.merge({
      anchorKey: 'emptyB',
      focusKey: 'emptyB',
    }),
  );
});

test('does not discard style override when changing block type', () => {
  let editor = EditorState.createEmpty();

  editor = RichTextEditorUtil.toggleInlineStyle(editor, 'BOLD');
  editor = RichTextEditorUtil.toggleBlockType(editor, 'test-block');

  expect(editor.getCurrentInlineStyle().toJS()).toMatchSnapshot();
});

test('does not discard style override when adjusting depth', () => {
  let editor = EditorState.createEmpty();

  editor = RichTextEditorUtil.toggleInlineStyle(editor, 'BOLD');
  editor = RichTextEditorUtil.onTab({preventDefault: () => {}}, editor, 1);

  expect(editor.getCurrentInlineStyle().toJS()).toMatchSnapshot();
});

test('does not discard style override when splitting block', () => {
  let editor = EditorState.createEmpty();

  editor = RichTextEditorUtil.toggleInlineStyle(editor, 'BOLD');
  editor = EditorState.push(
    editor,
    DraftModifier.splitBlock(editor.getCurrentContent(), editor.getSelection()),
    'split-block',
  );

  expect(editor.getCurrentInlineStyle().toJS()).toMatchSnapshot();
});

test('uses right of the start for blocks with text', () => {
  assertGetCurrentInlineStyle(rangedSelection.set('focusKey', 'b'));
});

test('uses left of the start if starting at end of block', () => {
  const blockB = UNDECORATED_STATE.getCurrentContent().getBlockForKey('b');
  assertGetCurrentInlineStyle(
    collapsedSelection.merge({
      anchorKey: 'b',
      anchorOffset: blockB.getLength(),
      focusKey: 'c',
      focusOffset: 3,
    }),
  );
});

test('looks upward through empty blocks to find a character', () => {
  assertGetCurrentInlineStyle(
    rangedSelection.merge({
      anchorKey: 'emptyA',
      anchorOffset: 0,
      focusKey: 'c',
      focusOffset: 3,
    }),
  );
});

test('falls back to no style if in empty block at document start', () => {
  assertGetCurrentInlineStyle(
    new SelectionState({
      anchorKey: 'emptyA',
      anchorOffset: 0,
      focusKey: 'c',
      focusOffset: 3,
      isBackward: false,
    }),
    MULTI_BLOCK_STATE,
  );
});

test('must set a new decorator', () => {
  const decorator = new Decorator();
  const editorState = getSampleEditorState('DECORATED', decorator);
  const boldB = List(Repeat('y', boldBlock.getLength()));

  expect(decorator.getDecorations.mock.calls.length).toMatchSnapshot();

  Decorator.prototype.getDecorations.mockImplementation((v, c) => {
    return v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()));
  });

  class NextDecorator {}
  NextDecorator.prototype.getDecorations = jest.fn();

  const newDecorator = new NextDecorator();

  NextDecorator.prototype.getDecorations.mockImplementation((v, c) => {
    return v === boldBlock ? boldB : List(Repeat(undefined, v.getLength()));
  });

  const withNewDecorator = EditorState.set(editorState, {
    decorator: newDecorator,
  });

  expect(withNewDecorator !== editorState).toMatchSnapshot();

  // Twice for the initial tree map generation, then twice more for
  // filter comparison.
  expect(decorator.getDecorations.mock.calls.length).toMatchSnapshot();

  // Twice for filter comparison, once for tree generation since one
  // block has the same decoration list and is filtered out.
  expect(newDecorator.getDecorations.mock.calls.length).toMatchSnapshot();

  expect(withNewDecorator.getDecorator() === newDecorator).toMatchSnapshot();

  // Preserve block trees that had the same decorator list.
  expect(
    editorState.getBlockTree(boldBlock.getKey()) ===
      withNewDecorator.getBlockTree(boldBlock.getKey()),
  ).toMatchSnapshot();

  expect(
    editorState.getBlockTree(italicBlock.getKey()) !==
      withNewDecorator.getBlockTree(italicBlock.getKey()),
  ).toMatchSnapshot();
});

test('must call decorator with correct argument types and order', () => {
  const decorator = new Decorator();
  getSampleEditorState('DECORATED', decorator);
  expect(decorator.getDecorations.mock.calls.length).toMatchSnapshot();
});

test('must correctly remove a decorator', () => {
  const decorator = new Decorator();
  const editorState = getSampleEditorState('DECORATED', decorator);
  const withNewDecorator = EditorState.set(editorState, {decorator: null});

  expect(withNewDecorator !== editorState).toMatchSnapshot();
  expect(decorator.getDecorations.mock.calls.length).toMatchSnapshot();
  expect(withNewDecorator.getDecorator()).toMatchSnapshot();
});
