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

import type {BlockNode, BlockNodeConfig, BlockNodeKey} from 'BlockNode';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const CharacterMetadata = require('CharacterMetadata');

const findRangesImmutable = require('findRangesImmutable');
const Immutable = require('immutable');

const {List, Map, OrderedSet, Record, Repeat} = Immutable;

const EMPTY_SET = OrderedSet();

const defaultRecord: BlockNodeConfig = {
  key: '',
  type: 'unstyled',
  text: '',
  characterList: List(),
  depth: 0,
  data: Map(),
};

const ContentBlockRecord = (Record(defaultRecord): any);

const decorateCharacterList = (config: BlockNodeConfig): BlockNodeConfig => {
  if (!config) {
    return config;
  }

  const {characterList, text} = config;

  if (text && !characterList) {
    config.characterList = List(Repeat(CharacterMetadata.EMPTY, text.length));
  }

  return config;
};

class ContentBlock extends ContentBlockRecord implements BlockNode {
  constructor(config: BlockNodeConfig) {
    super(decorateCharacterList(config));
  }

  // $FlowFixMe[method-unbinding]
  getKey(): BlockNodeKey {
    return this.get('key');
  }

  // $FlowFixMe[method-unbinding]
  getType(): DraftBlockType {
    return this.get('type');
  }

  // $FlowFixMe[method-unbinding]
  getText(): string {
    return this.get('text');
  }

  // $FlowFixMe[method-unbinding]
  getCharacterList(): List<CharacterMetadata> {
    return this.get('characterList');
  }

  // $FlowFixMe[method-unbinding]
  getLength(): number {
    return this.getText().length;
  }

  // $FlowFixMe[method-unbinding]
  getDepth(): number {
    return this.get('depth');
  }

  // $FlowFixMe[method-unbinding]
  getData(): Map<any, any> {
    return this.get('data');
  }

  // $FlowFixMe[method-unbinding]
  getInlineStyleAt(offset: number): DraftInlineStyle {
    const character = this.getCharacterList().get(offset);
    return character ? character.getStyle() : EMPTY_SET;
  }

  // $FlowFixMe[method-unbinding]
  getEntityAt(offset: number): ?string {
    const character = this.getCharacterList().get(offset);
    return character ? character.getEntity() : null;
  }

  /**
   * Execute a callback for every contiguous range of styles within the block.
   */
  // $FlowFixMe[method-unbinding]
  findStyleRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualStyle,
      filterFn,
      callback,
    );
  }

  /**
   * Execute a callback for every contiguous range of entities within the block.
   */
  // $FlowFixMe[method-unbinding]
  findEntityRanges(
    filterFn: (value: CharacterMetadata) => boolean,
    callback: (start: number, end: number) => void,
  ): void {
    findRangesImmutable(
      this.getCharacterList(),
      haveEqualEntity,
      filterFn,
      callback,
    );
  }
}

function haveEqualStyle(
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean {
  return charA.getStyle() === charB.getStyle();
}

function haveEqualEntity(
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean {
  return charA.getEntity() === charB.getEntity();
}

module.exports = ContentBlock;
