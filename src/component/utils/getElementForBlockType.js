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

import type {DraftBlockType} from 'DraftBlockType';

function getElementForBlockType(blockType: DraftBlockType): string {
  switch (blockType) {
    case 'header-one':
      return 'h2';
    case 'header-two':
      return 'h3';
    case 'unordered-list-item':
    case 'ordered-list-item':
      return 'li';
    case 'blockquote':
      return 'blockquote';
    case 'media':
      return 'figure';
    default:
      return 'div';
  }
}

module.exports = getElementForBlockType;
