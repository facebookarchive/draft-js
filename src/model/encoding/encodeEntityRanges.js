/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule encodeEntityRanges
 * @typechecks
 * @flow
 */

'use strict';

const DraftStringKey = require('DraftStringKey');
const UnicodeUtils = require('UnicodeUtils');

import type ContentBlock from 'ContentBlock';
import type {EntityRange} from 'EntityRange';

const {strlen} = UnicodeUtils;

/**
 * Convert to UTF-8 character counts for storage.
 */
function encodeEntityRanges(
  block: ContentBlock,
  storageMap: Object
): Array<EntityRange> {
  const encoded = [];
  block.findEntityRanges(
    character => !!character.getEntity(),
    (/*number*/ start, /*number*/ end) => {
      const text = block.getText();
      const key = block.getEntityAt(start);
      encoded.push({
        offset: strlen(text.slice(0, start)),
        length: strlen(text.slice(start, end)),
        // Encode the key as a number for range storage.
        key: Number(storageMap[DraftStringKey.stringify(key)]),
      });
    }
  );
  return encoded;
}

module.exports = encodeEntityRanges;
