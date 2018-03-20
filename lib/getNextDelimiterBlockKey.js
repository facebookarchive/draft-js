'use strict';

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getNextDelimiterBlockKey
 * @format
 * 
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 */

var ContentBlockNode = require('./ContentBlockNode');

var getNextDelimiterBlockKey = function getNextDelimiterBlockKey(block, blockMap) {
  var isExperimentalTreeBlock = block instanceof ContentBlockNode;

  if (!isExperimentalTreeBlock) {
    return null;
  }

  var nextSiblingKey = block.getNextSiblingKey();

  if (nextSiblingKey) {
    return nextSiblingKey;
  }

  var parent = block.getParentKey();

  if (!parent) {
    return null;
  }

  var nextNonDescendantBlock = blockMap.get(parent);
  while (nextNonDescendantBlock && !nextNonDescendantBlock.getNextSiblingKey()) {
    var parentKey = nextNonDescendantBlock.getParentKey();
    nextNonDescendantBlock = parentKey ? blockMap.get(parentKey) : null;
  }

  if (!nextNonDescendantBlock) {
    return null;
  }

  return nextNonDescendantBlock.getNextSiblingKey();
};

module.exports = getNextDelimiterBlockKey;