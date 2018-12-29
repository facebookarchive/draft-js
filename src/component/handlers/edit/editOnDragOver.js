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

import type DraftEditor from 'DraftEditor.react';

/**
 * Drag behavior has begun from outside the editor element.
 */
function editOnDragOver(editor: DraftEditor, e: SyntheticDragEvent<>): void {
  editor.setMode('drag');
  e.preventDefault();
}

module.exports = editOnDragOver;
