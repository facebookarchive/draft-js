/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

const DraftModifier = require('DraftModifier');
const EditorState = require('EditorState');
const Style = require('Style');

const getFragmentFromSelection = require('getFragmentFromSelection');
const getScrollPosition = require('getScrollPosition');
const isNode = require('isInstanceOfNode');

/**
 * On `cut` events, native behavior is allowed to occur so that the system
 * clipboard is set properly. This means that we need to take steps to recover
 * the editor DOM state after the `cut` has occurred in order to maintain
 * control of the component.
 *
 * In addition, we can keep a copy of the removed fragment, including all
 * styles and entities, for use as an internal paste.
 */
function editOnCut(editor: DraftEditor, e: SyntheticClipboardEvent<>): void {
  const editorState = editor._latestEditorState;
  const selection = editorState.getSelection();
  const element = e.target;
  let scrollPosition;

  // No selection, so there's nothing to cut.
  if (selection.isCollapsed()) {
    e.preventDefault();
    return;
  }

  // Track the current scroll position so that it can be forced back in place
  // after the editor regains control of the DOM.
  if (isNode(element)) {
    const node: Node = (element: any);
    scrollPosition = getScrollPosition(Style.getScrollParent(node));
  }

  const fragment = getFragmentFromSelection(editorState);
  editor.setClipboard(fragment);

  // Set `cut` mode to disable all event handling temporarily.
  editor.setMode('cut');

  // Let native `cut` behavior occur, then recover control.
  setTimeout(() => {
    editor.restoreEditorDOM(scrollPosition);
    editor.exitCurrentMode();
    editor.update(removeFragment(editorState));
  }, 0);
}

function removeFragment(editorState: EditorState): EditorState {
  const newContent = DraftModifier.removeRange(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    'forward',
  );
  return EditorState.push(editorState, newContent, 'remove-range');
}

module.exports = editOnCut;
