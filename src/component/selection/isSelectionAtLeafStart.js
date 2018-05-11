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

import type EditorState from 'EditorState';

function isSelectionAtLeafStart(editorState: EditorState): boolean {
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const blockTree = editorState.getBlockTree(anchorKey);
  const offset = selection.getStartOffset();

  let isAtStart = false;

  blockTree.some(leafSet => {
    if (offset === leafSet.get('start')) {
      isAtStart = true;
      return true;
    }

    if (offset < leafSet.get('end')) {
      return leafSet.get('leaves').some(leaf => {
        const leafStart = leaf.get('start');
        if (offset === leafStart) {
          isAtStart = true;
          return true;
        }

        return false;
      });
    }

    return false;
  });

  return isAtStart;
}

module.exports = isSelectionAtLeafStart;
