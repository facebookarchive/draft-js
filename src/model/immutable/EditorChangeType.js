/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

'use strict';

export type EditorChangeType =
  | 'adjust-depth'
  | 'apply-entity'
  | 'backspace-character'
  | 'change-block-data'
  | 'change-block-type'
  | 'change-inline-style'
  | 'move-block'
  | 'delete-character'
  | 'insert-characters'
  | 'insert-fragment'
  | 'redo'
  | 'remove-range'
  | 'spellcheck-change'
  | 'split-block'
  | 'undo';
