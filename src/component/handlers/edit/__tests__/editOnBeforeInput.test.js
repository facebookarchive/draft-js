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

//const collapsedSelection = new SelectionState(DEFAULT_SELECTION);

const rangedSelection = new SelectionState({
  ...DEFAULT_SELECTION,
  focusOffset: 1,
});

const getEditorState = () => {
  return EditorState.createWithContent(
    ContentState.createFromBlockArray([
      new ContentBlock({
        key: 'a',
        text: 'Arsenal',
      }),
    ]),
  );
};

const getInputEvent = data => ({
  data,
  preventDefault: () => {},
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
  expect(newEditorState.getCurrentContent()).toMatchSnapshot();
});
