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
 * A type that defines if an fragment shall be inserted before or after
 * another fragment or if the selected fragment shall be replaced
 */
export type DraftInsertionType = 'replace' | 'before' | 'after';
