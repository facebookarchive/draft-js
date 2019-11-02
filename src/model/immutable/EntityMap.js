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

import type {DraftEntityMapObject} from 'DraftEntity';

// TODO: when removing the deprecated Entity api
// change this to be
// OrderedMap<string, DraftEntityInstance>;
export type EntityMap = DraftEntityMapObject;
