/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftBlockRenderMap
 * @flow
 */

'use strict';

import type Immutable from 'immutable';

import type {DraftBlockRenderConfig} from 'DraftBlockRenderConfig';
import type {DraftBlockType} from 'DraftBlockType';

export type DraftBlockRenderMap = Immutable.Map<DraftBlockType, DraftBlockRenderConfig>
