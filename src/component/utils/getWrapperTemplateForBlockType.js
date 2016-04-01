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

const React = require('React');

import type {DraftBlockType} from 'DraftBlockType';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';

function getWrapperTemplateForBlockType(
  blockType: DraftBlockType,
  draftBlockRenderMap: DraftBlockRenderMap
): ?React.Element {
  const matchedBlockType = draftBlockRenderMap.get(blockType);

  return matchedBlockType && matchedBlockType.get('wrapper')  ?
    matchedBlockType.get('wrapper') :
    null;
}

module.exports = getWrapperTemplateForBlockType;
