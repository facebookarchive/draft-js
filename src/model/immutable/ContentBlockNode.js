/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This file is a fork of ContentBlock adding support for nesting references by
 * providing links to children, parent, prevSibling, and nextSibling.
 *
 * This is unstable and not part of the public API and should not be used by
 * production systems. This file may be update/removed without notice.
 *
 * @flow
 * @format
 * @oncall draft_js
 */

'use strict';

import type {BlockNode, BlockNodeConfig, BlockNodeKey} from 'BlockNode';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const CharacterMetadata = require('CharacterMetadata');

const findRangesImmutable = require('findRangesImmutable');
const Immutable = require('immutable');

const {List, Map, OrderedSet, Record, Repeat} = Immutable;

type ContentBlockNodeConfig = BlockNodeConfig & {
  children?: List<BlockNodeKey>,
  parent?: ?BlockNodeKey,
  prevSibling?: ?BlockNodeKey,
  nextSibling?: ?BlockNodeKey,
  ...
};

const EMPTY_SET = OrderedSet();

const defaultRecord: ContentBlockNodeConfig = {
  parent: null,
  characterList: List(),
  data: Map(),
  depth: 0,
  key: '',
  text: '',
  type: 'unstyled',
  children: List(),
  prevSibling: null,
  nextSibling: null,
};

const haveEqualStyle = (
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean => charA.getStyle() === charB.getStyle();

const haveEqualEntity = (
  charA: CharacterMetadata,
  charB: CharacterMetadata,
): boolean => charA.getEntity() === charB.getEntity();

const decorateCharacterList = (
  config: ContentBlockNodeConfig,
): ContentBlockNodeConfig => {
  if (!config) {
    return config;
  }

  const {characterList, text} = config;

  if (text && !characterList) {
    config.characterList = List(Repeat(CharacterMetadata.EMPTY, text.length));
  }

  return config;
};

class ContentBlockNode
  extends (Record(defaultRecord): any)
  implements BlockNode
{
  constructor(props: ContentBlockNodeConfig = defaultRecord) {
    /* eslint-disable-next-line constructor-super */
    super(decorateCharacterList(props));
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

  getChildKeys(): List<BlockNodeKey> {
    return this.get('children');
  }

  getParentKey(): ?BlockNodeKey {
    return this.get('parent');
  }

  getPrevSiblingKey(): ?BlockNodeKey {
    return this.get('prevSibling');
  }

  getNextSiblingKey(): ?BlockNodeKey {
    return this.get('nextSibling');
  }

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

module.exports = ContentBlockNode;
