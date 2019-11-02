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

import type ContentState from 'ContentState';
import type {DraftDecoratorType} from 'DraftDecoratorType';
import type SelectionState from 'SelectionState';

export type EditorStateCreationConfig = {
  allowUndo: boolean,
  currentContent: ContentState,
  decorator: ?DraftDecoratorType,
  selection: SelectionState,
};
