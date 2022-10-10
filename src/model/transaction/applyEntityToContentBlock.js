/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall draft_js
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';

const CharacterMetadata = require('CharacterMetadata');

function applyEntityToContentBlock(
  contentBlock: BlockNodeRecord,
  startArg: number,
  end: number,
  entityKey: ?string,
): BlockNodeRecord {
  let start = startArg;
  let characterList = contentBlock.getCharacterList();
  while (start < end) {
    characterList = characterList.set(
      start,
      CharacterMetadata.applyEntity(characterList.get(start), entityKey),
    );
    start++;
  }
  return contentBlock.set('characterList', characterList);
}

module.exports = applyEntityToContentBlock;
