/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule EntityRange
 * @format
 * @flow
 */

'use strict';

/**
 * A plain object representation of an entity attribution.
 */
export type EntityRange = {
  key: string,
  offset: number,
  length: number,
};
