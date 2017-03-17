/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule covertFromContentBlockToRaw
 * @flow
 */

'use strict';

var DraftStringKey = require('DraftStringKey');

var encodeEntityRanges = require('encodeEntityRanges');
var encodeInlineStyleRanges = require('encodeInlineStyleRanges');

import type ContentBlock from 'ContentBlock';
import type {RawDraftContentBlock} from 'RawDraftContentBlock';

function convertFromContentBlockToRaw(
  block: ContentBlock
): RawDraftContentBlock {
  var entityStorageKey = 0;
  var entityStorageMap = {};
  block.findEntityRanges(
    character => character.getEntity() !== null,
    start => {
      // Stringify to maintain order of otherwise numeric keys.
      var stringifiedEntityKey = DraftStringKey.stringify(
        block.getEntityAt(start)
      );
      if (!entityStorageMap.hasOwnProperty(stringifiedEntityKey)) {
        entityStorageMap[stringifiedEntityKey] = '' + (entityStorageKey++);
      }
    }
  );

  return {
    key: block.getKey(),
    text: block.getText(),
    type: block.getType(),
    depth: block.getDepth(),
    inlineStyleRanges: encodeInlineStyleRanges(block),
    entityRanges: encodeEntityRanges(block, entityStorageMap),
    data: block.getData().toObject(),
  };
}

module.exports = convertFromContentBlockToRaw;
