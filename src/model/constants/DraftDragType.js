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
 * A type that allows us to avoid passing boolean arguments
 * around to indicate whether a drag type is internal or external.
 */
export type DraftDragType = 'internal' | 'external';
