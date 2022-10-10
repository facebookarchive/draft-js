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

'use strict';

import type DraftEditor from 'DraftEditor.react';

/**
 * Drag behavior has begun from outside the editor element.
 */
function editOnDragOver(editor: DraftEditor, e: SyntheticDragEvent<>): void {
  editor.setMode('drag');
  e.preventDefault();
}

module.exports = editOnDragOver;
