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
const cx = require('cx');
const DefaultDraftBlock = require('DefaultDraftBlock');

import type {DraftBlockType} from 'DraftBlockType';
import type {DraftBlockMap} from 'DraftBlockMap';

function getWrapperTemplateForBlockType(
  blockType: DraftBlockType,
  customBlockMap: ?DraftBlockMap
): ?ReactElement {
  const draftBlockMap = customBlockMap !== undefined ? customBlockMap : DefaultDraftBlock;
  return draftBlockMap[blockType] && draftBlockMap[blockType].wrapper ? draftBlockMap[blockType].wrapper : null;
}

module.exports = getWrapperTemplateForBlockType;
