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

import immutable from 'immutable';

const {OrderedSet} = immutable;

export const BOLD = (OrderedSet.of('BOLD'): OrderedSet<string>);
export const BOLD_ITALIC = (OrderedSet.of(
  'BOLD',
  'ITALIC',
): OrderedSet<string>);
export const BOLD_ITALIC_UNDERLINE = (OrderedSet.of(
  'BOLD',
  'ITALIC',
  'UNDERLINE',
): OrderedSet<string>);
export const BOLD_UNDERLINE = (OrderedSet.of(
  'BOLD',
  'UNDERLINE',
): OrderedSet<string>);
export const CODE = (OrderedSet.of('CODE'): OrderedSet<string>);
export const ITALIC = (OrderedSet.of('ITALIC'): OrderedSet<string>);
export const ITALIC_UNDERLINE = (OrderedSet.of(
  'ITALIC',
  'UNDERLINE',
): OrderedSet<string>);
export const NONE = (OrderedSet(): OrderedSet<string>);
export const STRIKETHROUGH = (OrderedSet.of(
  'STRIKETHROUGH',
): OrderedSet<string>);
export const UNDERLINE = (OrderedSet.of('UNDERLINE'): OrderedSet<string>);
