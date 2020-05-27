/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @format
 * @flow strict-local
 */

'use strict';

const EditorState = require('EditorState');
const ContentState = require('ContentState');
const SelectionState = require('SelectionState');
const RawDraftEditorState = require('RawDraftEditorState');
const convertEditorStateToRaw = require('convertEditorStateToRaw');
const convertFromRawToEditorState = require('convertFromRawToEditorState');

const newEditorState = EditorState.createWithContent(ContentState.createFromText("first line\nsecond line"));
const blocks = newEditorState.getCurrentContent().getBlocksAsArray();
const anchorKey = blocks[0].getKey();
const focusKey = blocks[1].getKey();
const anchorOffset = 1;
const focusOffset = 5;
const isBackward = false;
const hasFocus = true;

const updateSelection = new SelectionState({
    anchorKey,
    anchorOffset,
    focusKey,
    focusOffset,
    isBackward,
    hasFocus
  });

  let newEditorState2 = EditorState.forceSelection(
    newEditorState,
    updateSelection
  );

const convertedToRawEditor = convertEditorStateToRaw(newEditorState2)

test('converts existing editor state to raw',()=>{    
    
    expect(convertedToRawEditor).toHaveProperty("rawContent")
    expect(convertedToRawEditor).toHaveProperty("rawSelection")
})

test('creates editor state from raw',()=>{

    const createdEditorFromRaw = convertFromRawToEditorState(convertedToRawEditor)
    const createdSelection = createdEditorFromRaw.getSelection();

    expect(createdSelection.getAnchorKey()).toBe(anchorKey)
    expect(createdSelection.getFocusKey()).toBe(focusKey)
    expect(createdSelection.getAnchorOffset()).toBe(anchorOffset)
    expect(createdSelection.getFocusOffset()).toBe(focusOffset)
    expect(createdSelection.getIsBackward()).toBe(isBackward)
    expect(createdSelection.getHasFocus()).toBe(hasFocus)
})