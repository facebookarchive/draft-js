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

/**
 * A plain object representation of an inline style range.
 */
export type InlineStyleRange = {
  style: string,
  offset: number,
  length: number,
  ...
};
