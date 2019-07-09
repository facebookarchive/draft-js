/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow
 * @format
 */

'use strict';

jest.disableAutomock();

const ContentBlock = require('ContentBlock');
const ContentState = require('ContentState');
const EditorState = require('EditorState');

const onInput = require('editOnInput');

jest.mock('findAncestorOffsetKey', () => jest.fn(() => 'blockkey-0-0'));
jest.mock('keyCommandPlainBackspace', () => jest.fn(() => ({})));

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
    const editorState = getEditorState(anchorNodeText);

    const editor = {
      _latestEditorState: editorState,
      props: {},
      update: jest.fn(),
      restoreEditorDOM: jest.fn(),
    };

    // $FlowExpectedError
    onInput(editor, inputEvent);

    expect(require('keyCommandPlainBackspace')).toHaveBeenCalledTimes(0);
    expect(editor.restoreEditorDOM).toHaveBeenCalledTimes(0);
    expect(editor.update).toHaveBeenCalledTimes(0);
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
    const editorState = getEditorState(anchorNodeText);

    const editor = {
      _latestEditorState: editorState,
      props: {},
      update: jest.fn(),
      restoreEditorDOM: jest.fn(),
    };

    // $FlowExpectedError
    onInput(editor, inputEvent);

    // $FlowExpectedError
    const newEditorState = require('keyCommandPlainBackspace').mock.results[0]
      .value;
    expect(require('keyCommandPlainBackspace')).toHaveBeenCalledWith(
      editorState,
    );
    expect(editor.restoreEditorDOM).toHaveBeenCalledTimes(1);
    expect(editor.update).toHaveBeenCalledWith(newEditorState);
  });
});
