/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentBlock
 * @typechecks
 * @flow
 */

'use strict';

var Immutable = require('immutable');

var findRangesImmutable = require('findRangesImmutable');

import type CharacterMetadata from 'CharacterMetadata';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

var {
  List,
  OrderedSet,
  Record,
} = Immutable;

const EMPTY_SET = OrderedSet();

var defaultRecord: {
  key: string;
  type: DraftBlockType;
  text: string;
  characterList: List<CharacterMetadata>;
  depth: number;
} = {
  key: '',
  type: 'unstyled',
  text: '',
  characterList: List(),
  depth: 0,
};

var ContentBlockRecord = Record(defaultRecord);

class ContentBlock extends ContentBlockRecord {
  getKey(): string {
    return this.get('key');
  }

  getType(): DraftBlockType {
    return this.get('type');
  }

  getText(): string {
    return this.get('text');
  }

  getCharacterList(): List<CharacterMetadata> {
    return this.get('characterList');
  }

  getLength(): number {
    return this.getText().length;
  }

  getDepth(): number {
    return this.get('depth');
  }

  getParentKey(): string {
    var key = this.getKey();
    var parts = key.split('/');

    return parts.slice(0, -1).join('/');
  }

  hasParent(): boolean {
    return (this.getParentKey() !== '');
  }

  getInnerKey(): string {
    var key = this.getKey();
    var parts = key.split('/');

    return parts[parts.length - 1];
  }

  getInlineStyleAt(offset: number): DraftInlineStyle {
    var character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  }

  getEntityAt(offset: number): ?string {
    var character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }

  /**
   * Execute a callback for every contiguous range of styles within the block.
   */
  findStyleRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualStyle,
      filterFn,
      callback
    );
  }

  /**
   * Execute a callback for every contiguous range of entities within the block.
   */
  findEntityRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualEntity,
      filterFn,
      callback
    );
  }
}

function haveEqualStyle(
  charA: CharacterMetadata,
  charB: CharacterMetadata
): boolean {
  return charA.getStyle() === charB.getStyle();
}

function haveEqualEntity(
  charA: CharacterMetadata,
  charB: CharacterMetadata
): boolean {
  return charA.getEntity() === charB.getEntity();
}

module.exports = ContentBlock;
