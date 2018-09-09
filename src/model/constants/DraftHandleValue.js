/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict
 * @emails oncall+draft_js
 */

/*eslint-disable no-bitwise*/

'use strict';

/**
 * A type that allows us to avoid returning boolean values
 * to indicate whether an event was handled or not.
 */
export type DraftHandleValue = 'handled' | 'not-handled';
