/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getElementForBlockType
 * @flow
 */

'use strict';

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

import type {DraftBlockType} from 'DraftBlockType';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';

function getElementForBlockType(
  blockType: DraftBlockType,
  draftBlockRenderMap: DraftBlockRenderMap
): string {
  const matchedBlockType = draftBlockRenderMap.get(blockType) ||
    draftBlockRenderMap.get('unstyled');

  const matchedBlockTypeTag = matchedBlockType ?
    matchedBlockType.get('element') :
    DefaultDraftBlockRenderMap.get('unstyled').get('element');

  return matchedBlockTypeTag;
}

module.exports = getElementForBlockType;
