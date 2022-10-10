/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentBlock from 'ContentBlock';

const ContentBlockNode = require('ContentBlockNode');

const getNextDelimiterBlockKey = (
  block: BlockNodeRecord,
  blockMap: BlockMap,
): ?string => {
  const isExperimentalTreeBlock = block instanceof ContentBlockNode;

  if (!isExperimentalTreeBlock) {
    return null;
  }

  const nextSiblingKey = block.getNextSiblingKey();

  if (nextSiblingKey) {
    return nextSiblingKey;
  }

  const parent = block.getParentKey();

  if (!parent) {
    return null;
  }

  let nextNonDescendantBlock: ?(
    | ContentBlock
    | BlockNodeRecord
    | ContentBlockNode
  ) = blockMap.get(parent);
  while (
    nextNonDescendantBlock &&
    !nextNonDescendantBlock.getNextSiblingKey()
  ) {
    const parentKey = nextNonDescendantBlock.getParentKey();
    nextNonDescendantBlock = parentKey ? blockMap.get(parentKey) : null;
  }

  if (!nextNonDescendantBlock) {
    return null;
  }

  return nextNonDescendantBlock.getNextSiblingKey();
};

module.exports = getNextDelimiterBlockKey;
