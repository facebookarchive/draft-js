/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftBlockRenderConfig
 * @flow
 */

'use strict';

const React = require('React');

import type Immutable from 'immutable';
import type {DraftBlockTag} from 'DraftBlockTag';

export type DraftBlockRenderConfig = Immutable.Map<DraftBlockTag, React.Element>
