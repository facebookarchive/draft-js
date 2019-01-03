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

import type ContentState from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type SelectionState from 'SelectionState';

export type EditorStateCreationConfig = {
  allowUndo: boolean,
  currentContent: ContentState,
  decorator: ?DraftDecoratorType,
  selection: SelectionState,
};
