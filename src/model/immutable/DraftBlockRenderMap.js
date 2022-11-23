/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {DraftBlockRenderConfig} from 'DraftBlockRenderConfig';
import type {Map} from 'immutable';

// We should be able to be more specific on the key type
// once we upgrade to immutable v4
// https://github.com/facebook/immutable-js/issues/1371
export type DraftBlockRenderMap = Map<any, DraftBlockRenderConfig>;
