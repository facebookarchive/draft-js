/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import type {RawDraftContentBlock} from 'RawDraftContentBlock';
import type {RawDraftEntity} from 'RawDraftEntity';

/**
 * A type that represents a composed document as vanilla JavaScript objects,
 * with all styles and entities represented as ranges. Corresponding entity
 * objects are packaged as objects as well.
 *
 * This object is especially useful when sending the document state to the
 * server for storage, as its representation is more concise than our
 * immutable objects.
 */
export type RawDraftContentState = {
  blocks: Array<RawDraftContentBlock>,
  entityMap: {[key: string]: RawDraftEntity},
};
