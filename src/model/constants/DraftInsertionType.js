/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftInsertionType
 * @flow
 */

'use strict';

/**
 * A type that defines if an fragment shall be inserted before or after
 * another fragment or if the selected fragment shall be replaced
 */
export type DraftInsertionType = 'replace' | 'before' | 'after';
