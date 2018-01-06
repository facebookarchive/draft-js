/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+draft_js
 * @format
 */

'use strict';

jest.disableAutomock();
jest.mock('generateRandomKey');

const DraftEditorDragHandler = require('DraftEditorDragHandler');
const EditorState = require('EditorState');
const SelectionState = require('SelectionState');
const getSampleSelectionMocksForTesting = require('getSampleSelectionMocksForTesting');
const editOnDragStart = require('editOnDragStart');

let editorState = null;
let leafChildren = null;
let textNodes = null;

// sample text:
// WashingtonJefferson
// LincolnRoosevelt
// KennedyObama
const resetRootNodeMocks = () => {
  ({
    editorState,
    leafChildren,
    textNodes,
  } = getSampleSelectionMocksForTesting());
  editorState = EditorState.acceptSelection(
    editorState,
    new SelectionState(RESET_SELECTION),
  );
};

const RESET_SELECTION = {
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
};

beforeEach(() => {
  resetRootNodeMocks();
});

test('drag-n-drop should be done correctly', () => {
  //second word from line 2 + first word from line 3 ("Roosevelt\nKennedy")
  const selectionRooseveltKennedy = {
    anchorKey: 'b',
    anchorOffset: textNodes[2].nodeValue.length,
    focusKey: 'c',
    focusOffset: textNodes[4].nodeValue.length,
    isBackward: false,
  };

  const selectionStateRooseveltKennedy = new SelectionState(
    selectionRooseveltKennedy,
  );

  const getDropEvent_RooseveltKennedy_toEnd = () => ({
    nativeEvent: {
      // drop position is end of last word ("Obama")
      rangeParent: leafChildren[leafChildren.length - 1],
      rangeOffset: textNodes[textNodes.length - 1].nodeValue.length,
      // data contains text "Roosevelt\nKennedy"
      dataTransfer: {
        getData: () => {
          return textNodes[3].nodeValue + '\n' + textNodes[4].nodeValue;
        },
      },
    },
    preventDefault: jest.fn(),
  });

  const editorStateRooseveltKennedy = EditorState.acceptSelection(
    editorState,
    selectionStateRooseveltKennedy,
  );

  const editor = {
    _latestEditorState: editorStateRooseveltKennedy,
    props: {},
    update: jest.fn(),
    exitCurrentMode: jest.fn(),
    setMode: jest.fn(),
    nodeType: 1, //ELEMENT_NODE
    dispatchEvent: jest.fn(),
  };

  expect(() => {
    editOnDragStart(editor);
    DraftEditorDragHandler.onDrop(
      editor,
      getDropEvent_RooseveltKennedy_toEnd(),
    );
  }).not.toThrow();

  // result should be:
  // WashingtonJefferson
  // LincolnObamaRoosevelt
  // Kennedy
  expect(editor.setMode).toHaveBeenCalledTimes(1);
  expect(editor.exitCurrentMode).toHaveBeenCalledTimes(1);
  expect(editor.update).toHaveBeenCalledTimes(1);

  const newEditorState = editor.update.mock.calls[0][0];
  expect(newEditorState.getSelection().toJS()).toMatchSnapshot();
  expect(newEditorState.getCurrentContent().toJS()).toMatchSnapshot();
});
