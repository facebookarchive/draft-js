/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getWrapperTemplateForBlockType
 * @flow
 */

'use strict';

const DefaultDraftBlockRenderMap = require('DefaultDraftBlockRenderMap');

import type {DraftBlockType} from 'DraftBlockType';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';

function getWrapperTemplateForBlockType(
  blockType: DraftBlockType,
  customBlockMap: DraftBlockRenderMap
): ?ReactElement {
  const draftBlockRenderMap = customBlockMap !== undefined ? customBlockMap : DefaultDraftBlockRenderMap;
  return draftBlockRenderMap[blockType] && draftBlockRenderMap[blockType].wrapper ?
    draftBlockRenderMap[blockType].wrapper :
    null;
}

module.exports = getWrapperTemplateForBlockType;
