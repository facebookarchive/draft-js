/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {DraftInlineStyle} from 'DraftInlineStyle';

const CharacterMetadata = require('CharacterMetadata');
const Immutable = require('immutable');

const {List} = Immutable;

function createCharacterList(
  inlineStyles: Array<DraftInlineStyle>,
  entities: Array<?string>,
): List<CharacterMetadata> {
  const characterArray = inlineStyles.map((style, ii) => {
    const entity = entities[ii];
    return CharacterMetadata.create({style, entity});
  });
  return List(characterArray);
}

module.exports = createCharacterList;
