/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

import type ContentState from 'ContentState';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftEditorCommand} from 'DraftEditorCommand';
import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';
import type URI from 'URI';

export type DataObjectForLink = {url: string, ...};

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
  ...
};
