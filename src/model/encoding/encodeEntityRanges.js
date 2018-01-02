/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule encodeEntityRanges
 * @format
 * @flow
 */

'use strict';

import type ContentBlock from 'ContentBlock';
import type {DraftEntitySet} from 'DraftEntitySet';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {EntityRange} from 'EntityRange';
import type {List} from 'immutable';

var UnicodeUtils = require('UnicodeUtils');

var findRangesImmutable = require('findRangesImmutable');

var areEqual = (a, b) => a === b;
var isTruthy = a => !!a;
var EMPTY_ARRAY = [];

/**
 * Helper function for getting encoded styles for each entity. Convert
 * to UTF-8 character counts for storage.
 */
function getEncodedInlinesForType(
  block: ContentBlock,
  entities: List<DraftEntitySet>,
  entityKey: string,
): Array<EntityRange> {
  var ranges = [];

  // Obtain an array with ranges for only the specified key.
  var filteredInlines = entities.map(e => e.has(entityKey)).toList();

  findRangesImmutable(
    filteredInlines,
    areEqual,
    // We only want to keep ranges with nonzero entity values.
    isTruthy,
    (start, end) => {
      var text = block.getText();
      ranges.push({
        offset: UnicodeUtils.strlen(text.slice(0, start)),
        length: UnicodeUtils.strlen(text.slice(start, end)),
        key: entityKey,
      });
    },
  );

  return ranges;
}

/*
 * Retrieve the encoded arrays of entities, with each entity
 * treated separately.
 */
function encodeEntityRanges(block: ContentBlock): Array<EntityRange> {
  var entities = block
    .getCharacterList()
    .map(c => c.getEntity())
    .toList();
  var ranges = entities
    .flatten()
    .toSet()
    .map(style => getEncodedInlinesForType(block, entities, style));

  return Array.prototype.concat.apply(EMPTY_ARRAY, ranges.toJS());
}

module.exports = encodeEntityRanges;
