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
const RawDraftEditorState = require('RawDraftEditorState');
const convertEditorStateToRaw = require('convertEditorStateToRaw');

test('converts existing editor state to raw',()=>{

    const editorState = EditorState.createWithContent(ContentState.createFromText("test content"))
    const rawEditorState = convertEditorStateToRaw(editorState)

    expect(rawEditorState).toHaveProperty("rawContent")
    expect(rawEditorState).toHaveProperty("rawSelection")
})