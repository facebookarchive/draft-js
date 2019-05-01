/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 * @emails oncall+draft_js
 */

'use strict';

/**
 * A type that allows us to avoid returning boolean values
 * to indicate whether an event was handled or not.
 */
export type DraftHandleValue = 'handled' | 'not-handled' | boolean;
