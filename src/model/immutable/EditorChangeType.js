/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EditorChangeType
 * @flow
 */

/*eslint-disable no-bitwise*/

'use strict';

export type EditorChangeType = (
  'undo' |
  'redo' |
  'change-selection' |
  'insert-characters' |
  'backspace-character' |
  'delete-character' |
  'remove-range' |
  'split-block' |
  'insert-fragment' |
  'change-inline-style' |
  'change-block-type' |
  'apply-entity' |
  'reset-block' |
  'adjust-depth' |
  'spellcheck-change'
);
