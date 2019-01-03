/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

export type DataObjectForLink = {
  url: string,
};

export type RichTextUtils = {
  currentBlockContainsLink: (editorState: EditorState) => boolean,

  getCurrentBlockType: (editorState: EditorState) => DraftBlockType,

  getDataObjectForLinkURL: (uri: URI) => DataObjectForLink,

  handleKeyCommand: (
    editorState: EditorState,
    command: DraftEditorCommand | string,
  ) => ?EditorState,

  insertSoftNewline: (editorState: EditorState) => EditorState,

  onBackspace: (editorState: EditorState) => ?EditorState,

  onDelete: (editorState: EditorState) => ?EditorState,

  onTab: (
    event: SyntheticKeyboardEvent<>,
    editorState: EditorState,
    maxDepth: number,
  ) => EditorState,

  toggleBlockType: (
    editorState: EditorState,
    blockType: DraftBlockType,
  ) => EditorState,

  toggleCode: (editorState: EditorState) => EditorState,

  toggleInlineStyle: (
    editorState: EditorState,
    inlineStyle: string,
  ) => EditorState,

  toggleLink: (
    editorState: EditorState,
    targetSelection: SelectionState,
    entityKey: ?string,
  ) => EditorState,

  tryToRemoveBlockStyle: (editorState: EditorState) => ?ContentState,
};
