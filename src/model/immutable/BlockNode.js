/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+draft_js
 */

'use strict';

import type CharacterMetadata from 'CharacterMetadata';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {List, Map} from 'immutable';

export type BlockNodeKey = string;

export type BlockNodeConfig = {
  characterList?: List<CharacterMetadata>,
  data?: Map<any, any>,
  depth?: number,
  key?: BlockNodeKey,
  text?: string,
  type?: DraftBlockType,
};

// https://github.com/facebook/draft-js/issues/1492
// prettier-ignore
export interface BlockNode {
  +findEntityRanges: (
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ) => void,

  +findStyleRanges: (
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ) => void,

  +getCharacterList: () => List<CharacterMetadata>,

  +getData: () => Map<any, any>,

  +getDepth: () => number,

  +getEntityAt: (offset: number) => ?string,

  +getInlineStyleAt: (offset: number) => DraftInlineStyle,

  +getKey: () => BlockNodeKey,

  +getLength: () => number,

  +getText: () => string,

  +getType: () => DraftBlockType,
}
