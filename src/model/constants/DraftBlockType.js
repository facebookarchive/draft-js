/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict
 * @format
 */

'use strict';

/**
 * The list of default valid block types.
 */
export type CoreDraftBlockType =
  | 'unstyled'
  | 'paragraph'
  | 'header-one'
  | 'header-two'
  | 'header-three'
  | 'header-four'
  | 'header-five'
  | 'header-six'
  | 'unordered-list-item'
  | 'ordered-list-item'
  | 'blockquote'
  | 'code-block'
  | 'atomic'
  | 'section'
  | 'article';

/**
 * User defined types can be of any valid string.
 */
export type CustomBlockType = string;

export type DraftBlockType = CoreDraftBlockType | CustomBlockType;
