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

const CompositeDraftDecorator = require('CompositeDraftDecorator');
const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const onBeforeInput = require('editOnBeforeInput');

const DEFAULT_SELECTION = {
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
};

const rangedSelection = new SelectionState({
  ...DEFAULT_SELECTION,
  focusOffset: 1,
});

const rangedSelectionBackwards = new SelectionState({
  ...DEFAULT_SELECTION,
  anchorOffset: 1,
  isBackward: true,
});

const getEditorState = (text: string = 'Arsenal') => {
  return EditorState.createWithContent(
    ContentState.createFromBlockArray([
      new ContentBlock({
        key: 'a',
        text,
      }),
    ]),
  );
};

const getInputEvent = data => ({
  data,
  preventDefault: jest.fn(),
});

test('editor is not updated if no character data is provided', () => {
  const editorState = EditorState.acceptSelection(
    getEditorState(),
    rangedSelection,
  );

  const editor = {
    _latestEditorState: editorState,
    props: {},
    update: jest.fn(),
  };

  onBeforeInput(editor, getInputEvent());

  expect(editor.update).toHaveBeenCalledTimes(0);
});

test('editor is not updated if handled by handleBeforeInput', () => {
  const editorState = EditorState.acceptSelection(
    getEditorState(),
    rangedSelection,
  );

  const editor = {
    _latestEditorState: editorState,
    props: {
      handleBeforeInput: () => true,
    },
    update: jest.fn(),
  };

  onBeforeInput(editor, getInputEvent('O'));

  expect(editor.update).toHaveBeenCalledTimes(0);
});

test('editor is updated with new text if it does not match current selection', () => {
  const editorState = EditorState.acceptSelection(
    getEditorState(),
    rangedSelection,
  );

  const editor = {
    _latestEditorState: editorState,
    props: {},
    update: jest.fn(),
  };

  onBeforeInput(editor, getInputEvent('O'));

  expect(editor.update).toHaveBeenCalledTimes(1);

  const newEditorState = editor.update.mock.calls[0][0];
  expect(newEditorState.getCurrentContent()).toMatchSnapshot();
});

test('editor selectionstate is updated if new text matches current selection', () => {
  const editorState = EditorState.acceptSelection(
    getEditorState(),
    rangedSelection,
  );

  const editor = {
    _latestEditorState: editorState,
    props: {},
    update: jest.fn(),
  };

  onBeforeInput(editor, getInputEvent('A'));

  expect(editor.update).toHaveBeenCalledTimes(1);

  const newEditorState = editor.update.mock.calls[0][0];
  expect(newEditorState.getSelection()).toMatchSnapshot();
});

test('editor selectionstate is updated if new text matches current selection and user selected backwards', () => {
  const editorState = EditorState.acceptSelection(
    getEditorState(),
    rangedSelectionBackwards,
  );

  const editor = {
    _latestEditorState: editorState,
    props: {},
    update: jest.fn(),
  };

  onBeforeInput(editor, getInputEvent('A'));

  expect(editor.update).toHaveBeenCalledTimes(1);

  const newEditorState = editor.update.mock.calls[0][0];
  expect(newEditorState.getSelection()).toMatchSnapshot();
});

const HASHTAG_REGEX = /#[a-z]+/g;
function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function testDecoratorFingerprint(
  text,
  selection,
  charToInsert,
  shouldPrevent,
) {
  const editorState = EditorState.acceptSelection(
    EditorState.set(getEditorState(text), {
      decorator: new CompositeDraftDecorator([
        {
          strategy: hashtagStrategy,
          component: null,
        },
      ]),
    }),
    new SelectionState({
      ...DEFAULT_SELECTION,
      anchorOffset: selection,
      focusOffset: selection,
    }),
  );

  const editor = {
    _latestEditorState: editorState,
    _latestCommittedEditorState: editorState,
    props: {},
    update: jest.fn(),
  };

  const ev = getInputEvent(charToInsert);
  onBeforeInput(editor, ev);

  expect(ev.preventDefault.mock.calls.length).toBe(shouldPrevent ? 1 : 0);
}

test('decorator fingerprint logic bails out of native insertion', () => {
  const oldGetSelection = global.getSelection;
  try {
    global.getSelection = () => ({});

    // Make sure we prevent native insertion in the right cases
    testDecoratorFingerprint('hi #', 4, 'f', true);
    testDecoratorFingerprint('x #foo', 3, '#', true);
    testDecoratorFingerprint('#foobar', 4, ' ', true);

    // but these are OK to let through
    testDecoratorFingerprint('#foo', 4, 'b', false);
    testDecoratorFingerprint('#foo bar #baz', 2, 'o', false);
    testDecoratorFingerprint('#foo bar #baz', 7, 'o', false);
    testDecoratorFingerprint('#foo bar #baz', 12, 'a', false);
  } finally {
    global.getSelection = oldGetSelection;
  }
});
