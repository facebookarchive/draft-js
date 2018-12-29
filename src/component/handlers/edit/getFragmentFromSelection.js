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

'use strict';

import type {BlockMap} from 'BlockMap';
import type EditorState from 'EditorState';

const getContentStateFragment = require('getContentStateFragment');

function getFragmentFromSelection(editorState: EditorState): ?BlockMap {
  const selectionState = editorState.getSelection();

  if (selectionState.isCollapsed()) {
    return null;
  }

  return getContentStateFragment(
    editorState.getCurrentContent(),
    selectionState,
  );
}

module.exports = getFragmentFromSelection;
