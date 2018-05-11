/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type ContentState from 'ContentState';
import type {DraftRemovalDirection} from 'DraftRemovalDirection';
import type EditorState from 'EditorState';
import type SelectionState from 'SelectionState';

const DraftModifier = require('DraftModifier');

/**
 * For a collapsed selection state, remove text based on the specified strategy.
 * If the selection state is not collapsed, remove the entire selected range.
 */
function removeTextWithStrategy(
  editorState: EditorState,
  strategy: (editorState: EditorState) => SelectionState,
  direction: DraftRemovalDirection,
): ContentState {
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  let target = selection;
  if (selection.isCollapsed()) {
    if (direction === 'forward') {
      if (editorState.isSelectionAtEndOfContent()) {
        return content;
      }
    } else if (editorState.isSelectionAtStartOfContent()) {
      return content;
    }

    target = strategy(editorState);
    if (target === selection) {
      return content;
    }
  }
  return DraftModifier.removeRange(content, target, direction);
}

module.exports = removeTextWithStrategy;
