/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict-local
 * @format
 */

'use strict';

const EditorState = require('EditorState');

function keyCommandUndo(
  e: SyntheticKeyboardEvent<>,
  editorState: EditorState,
  updateFn: (editorState: EditorState) => void,
): void {
  const undoneState = EditorState.undo(editorState);

  // If the last change to occur was a spellcheck change, allow the undo
  // event to fall through to the browser. This allows the browser to record
  // the unwanted change, which should soon lead it to learn not to suggest
  // the correction again.
  if (editorState.getLastChangeType() === 'spellcheck-change') {
    const nativelyRenderedContent = undoneState.getCurrentContent();
    updateFn(EditorState.set(undoneState, {nativelyRenderedContent}));
    return;
  }

  // Otheriwse, manage the undo behavior manually.
  e.preventDefault();
  if (!editorState.getNativelyRenderedContent()) {
    updateFn(undoneState);
    return;
  }

  // Trigger a re-render with the current content state to ensure that the
  // component tree has up-to-date props for comparison.
  updateFn(EditorState.set(editorState, {nativelyRenderedContent: null}));

  // Wait to ensure that the re-render has occurred before performing
  // the undo action.
  setTimeout(() => {
    updateFn(undoneState);
  }, 0);
}

module.exports = keyCommandUndo;
