/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnDragStart
 * @flow
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
