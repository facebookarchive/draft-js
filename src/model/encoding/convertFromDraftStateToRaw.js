/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule convertFromDraftStateToRaw
 * @flow
 */

'use strict';

var DraftStringKey = require('DraftStringKey');

import type ContentState from 'ContentState';
import type {RawDraftContentState} from 'RawDraftContentState';
import convertFromContentBlockToRaw from 'convertFromContentBlockToRaw';

function convertFromDraftStateToRaw(
  contentState: ContentState
): RawDraftContentState {
  var entityStorageMap = {};
  var rawBlocks = contentState.getBlocksAsArray().map(convertFromContentBlockToRaw);

  // Flip storage map so that our storage keys map to global
  // DraftEntity keys.
  var entityKeys = Object.keys(entityStorageMap);
  var flippedStorageMap = {};
  entityKeys.forEach((key, jj) => {
    var entity = contentState.getEntity(DraftStringKey.unstringify(key));
    flippedStorageMap[jj] = {
      type: entity.getType(),
      mutability: entity.getMutability(),
      data: entity.getData(),
    };
  });

  return {
    entityMap: flippedStorageMap,
    blocks: rawBlocks,
  };
}

module.exports = convertFromDraftStateToRaw;
