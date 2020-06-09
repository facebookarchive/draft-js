/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+draft_js
 * @flow strict
 * @format
 */

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {RawDraftContentBlock} from 'RawDraftContentBlock';

const headerTypes = [
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
];

const listTypes = ['unordered-list-item', 'ordered-list-item'];

const isHeaderBlock = (
  block?: RawDraftContentBlock | BlockNodeRecord,
): boolean => {
  if (!block || !block.type) {
    return false;
  }
  return headerTypes.includes(block.type);
};

const isListBlock = (
  block?: RawDraftContentBlock | BlockNodeRecord,
): boolean => {
  if (!(block && block.type)) {
    return false;
  }
  return listTypes.includes(block.type);
};

module.exports = {
  isHeaderBlock,
  isListBlock,
};
