/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shouldNotAddWrapperElement
 * @format
 * @flow
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';

/**
 * We will use this helper to identify blocks that need to be wrapped but have siblings that
 * also share the same wrapper element, this way we can do the wrapping once the last sibling
 * is added.
 */
const shouldNotAddWrapperElement = (
  block: BlockNodeRecord,
  contentState: ContentState,
): boolean => {
  const nextSiblingKey = block.getNextSiblingKey();

  return nextSiblingKey
    ? contentState.getBlockForKey(nextSiblingKey).getType() === block.getType()
    : false;
};

module.exports = shouldNotAddWrapperElement;
