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

import * as DraftModifier from 'DraftModifier';
import EditorState from 'EditorState';

export default function keyCommandInsertNewline(
  editorState: EditorState,
): EditorState {
  const contentState = DraftModifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection(),
  );
  return EditorState.push(editorState, contentState, 'split-block');
}
