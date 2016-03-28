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

const DefaultDraftBlock = require('DefaultDraftBlock');

import type {DraftBlockType} from 'DraftBlockType';
import type {DraftBlockMap} from 'DraftBlockMap';

function getElementForBlockType(
  blockType: DraftBlockType,
  customBlockMap: ?DraftBlockMap
): string {
  const draftBlockMap = customBlockMap !== undefined ? customBlockMap : DefaultDraftBlock;

  return draftBlockMap[blockType] && draftBlockMap[blockType].element ?
    draftBlockMap[blockType].element :
    draftBlockMap.unstyled.element;
}

module.exports = getElementForBlockType;
