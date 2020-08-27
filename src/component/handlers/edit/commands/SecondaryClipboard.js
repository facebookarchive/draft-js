/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+draft_js
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type SelectionState from 'SelectionState';

import * as DraftModifier from 'DraftModifier';
import EditorState from 'EditorState';

import getContentStateFragment from 'getContentStateFragment';
import nullthrows from 'nullthrows';

let clipboard: ?BlockMap = null;

export function cut(editorState: EditorState): EditorState {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  let targetRange: ?SelectionState = null;

  if (selection.isCollapsed()) {
    const anchorKey = selection.getAnchorKey();
    const blockEnd = content.getBlockForKey(anchorKey).getLength();

    if (blockEnd === selection.getAnchorOffset()) {
      const keyAfter = content.getKeyAfter(anchorKey);
      if (keyAfter == null) {
        return editorState;
      }
      targetRange = selection.set('focusKey', keyAfter).set('focusOffset', 0);
    } else {
      targetRange = selection.set('focusOffset', blockEnd);
    }
  } else {
    targetRange = selection;
  }

  targetRange = nullthrows(targetRange);
  // TODO: This should actually append to the current state when doing
  // successive ^K commands without any other cursor movement
  clipboard = getContentStateFragment(content, targetRange);

  const afterRemoval = DraftModifier.removeRange(
    content,
    targetRange,
    'forward',
  );

  if (afterRemoval === content) {
    return editorState;
  }

  return EditorState.push(editorState, afterRemoval, 'remove-range');
}

export function paste(editorState: EditorState): EditorState {
  if (!clipboard) {
    return editorState;
  }

  const newContent = DraftModifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    clipboard,
  );

  return EditorState.push(editorState, newContent, 'insert-fragment');
}
