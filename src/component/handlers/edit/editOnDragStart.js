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

import type DraftEditor from 'DraftEditor.react';

/**
 * A `dragstart` event has begun within the text editor component.
 */
function editOnDragStart(editor: DraftEditor): void {
  editor._internalDrag = true;
  editor.setMode('drag');
}

module.exports = editOnDragStart;
