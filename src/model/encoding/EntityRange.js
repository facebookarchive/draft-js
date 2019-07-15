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
 * A plain object representation of an entity attribution.
 *
 * The `key` value corresponds to the key of the entity in the `entityMap` of
 * a `ComposedText` object, not for use with `DraftEntity.get()`.
 */
export type EntityRange = {
  key: number,
  offset: number,
  length: number,
};
