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

const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');

const onInput = require('editOnInput');

jest.mock('findAncestorOffsetKey', () => jest.fn(() => 'blockkey-0-0'));
jest.mock('keyCommandPlainBackspace');

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

const getEditorState = (text: string = '') => {
  return EditorState.createWithContent(
    ContentState.createFromBlockArray([
      new ContentBlock({
        key: 'blockkey',
        text,
      }),
    ]),
  );
};

function withGlobalGetSelectionAs(getSelectionValue = {}, callback) {
  const oldGetSelection = global.getSelection;
  try {
    global.getSelection = () => getSelectionValue;
    callback();
  } finally {
    global.getSelection = oldGetSelection;
  }
}

test('restoreEditorDOM and keyCommandPlainBackspace are NOT called when the `inputType` is not from a backspace press', () => {
  const inputEvent = {
    nativeEvent: {inputType: 'insetText'},
  };
  const anchorNodeText = 'react draftjs';
  const globalSelection = {
    anchorNode: document.createTextNode(anchorNodeText),
  };
  withGlobalGetSelectionAs(globalSelection, () => {
    const editorState = EditorState.acceptSelection(
      getEditorState(anchorNodeText),
      rangedSelection,
    );

    const editor = {
      _latestEditorState: editorState,
      props: {},
      update: jest.fn(),
      restoreEditorDOM: jest.fn(),
    };

    onInput(editor, inputEvent);

    expect(editor.restoreEditorDOM).toHaveBeenCalledTimes(0);
    expect(require('keyCommandPlainBackspace')).toHaveBeenCalledTimes(0);
  });
});

test('restoreEditorDOM and keyCommandPlainBackspace are called when backspace is pressed', () => {
  const inputEvent = {
    // When Backspace is pressed and input-type is supported, an event with
    // inputType === 'deleteContentBackward' is triggered by the browser.
    nativeEvent: {inputType: 'deleteContentBackward'},
  };
  const anchorNodeText = 'react draftjs';
  const globalSelection = {
    anchorNode: document.createTextNode(anchorNodeText),
  };
  withGlobalGetSelectionAs(globalSelection, () => {
    const editorState = EditorState.acceptSelection(
      getEditorState(anchorNodeText),
      rangedSelection,
    );

    const editor = {
      _latestEditorState: editorState,
      props: {},
      update: jest.fn(),
      restoreEditorDOM: jest.fn(),
    };

    onInput(editor, inputEvent);

    expect(editor.restoreEditorDOM).toHaveBeenCalledTimes(1);
    expect(require('keyCommandPlainBackspace')).toHaveBeenCalledWith(
      editorState,
    );
  });
});
