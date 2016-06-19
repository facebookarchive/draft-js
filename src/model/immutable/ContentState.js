/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentState
 * @typechecks
 * @flow
 */
'use strict';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const Immutable = require('immutable');
const SelectionState = require('SelectionState');

const generateRandomKey = require('generateRandomKey');
const sanitizeDraftText = require('sanitizeDraftText');

import type {BlockMap} from 'BlockMap';

const {List, Record, Repeat} = Immutable;

const defaultRecord: {
  blockMap: ?BlockMap;
  selectionBefore: ?SelectionState;
  selectionAfter: ?SelectionState;
} = {
  blockMap: null,
  selectionBefore: null,
  selectionAfter: null,
};

const ContentStateRecord = Record(defaultRecord);

class ContentState extends ContentStateRecord {
  getBlockMap(): BlockMap {
    return this.get('blockMap');
  }

  getSelectionBefore(): SelectionState {
    return this.get('selectionBefore');
  }

  getSelectionAfter(): SelectionState {
    return this.get('selectionAfter');
  }

  getBlockForKey(key: string): ContentBlock {
    var block: ContentBlock = this.getBlockMap().get(key);
    return block;
  }

  getFirstLevelBlocks(): BlockMap {
    return this.getBlockChildren('');
  }

  /*
   * This algorithm is used to create the blockMap nesting as well as to
   * enhance performance checks for nested blocks allowing each block to
   * know when any of it's children has changed.
   */
  getBlockDescendants() {
    return this.getBlockMap()
      .reverse()
      .reduce((treeMap, block) => {
        const key = block.getKey();
        const parentKey = block.getParentKey();
        const rootKey = '__ROOT__';

        // create one if does not exist
        const blockList = (
          treeMap.get(key) ?
            treeMap :
            treeMap.set(key, new Immutable.Map({
              firstLevelBlocks: new Immutable.OrderedMap(),
              childrenBlocks: new Immutable.Set()
            }))
        );

        if (parentKey) {
          // create one if does not exist
          const parentList = (
            blockList.get(parentKey) ?
              blockList :
              blockList.set(parentKey, new Immutable.Map({
                firstLevelBlocks: new Immutable.OrderedMap(),
                childrenBlocks: new Immutable.Set()
              }))
          );

          // add current block to parent children list
          const addBlockToParentList = parentList.setIn([parentKey, 'firstLevelBlocks', key], block);
          const addGrandChildren = addBlockToParentList.setIn(
            [parentKey, 'childrenBlocks'],
            addBlockToParentList.getIn([parentKey, 'childrenBlocks'])
              .add(
                // we include all the current block children and itself
                addBlockToParentList.getIn([key, 'childrenBlocks']).add(block)
              )
          );

          return addGrandChildren;
        } else {
          // we are root level block
          // lets create a new key called firstLevelBlocks
          const rootLevelBlocks = (
            blockList.get(rootKey) ?
              blockList :
              blockList.set(rootKey, new Immutable.Map({
                firstLevelBlocks: new Immutable.OrderedMap(),
                childrenBlocks: new Immutable.Set()
              }))
          );

          const rootFirstLevelBlocks = rootLevelBlocks.setIn([rootKey, 'firstLevelBlocks', key], block);

          const addToRootChildren = rootFirstLevelBlocks.setIn(
            [rootKey, 'childrenBlocks'],
            rootFirstLevelBlocks.getIn([rootKey, 'childrenBlocks'])
              .add(
                // we include all the current block children and itself
                rootFirstLevelBlocks.getIn([key, 'childrenBlocks']).add(block)
              )
          );

          return addToRootChildren;
        }
      }, new Immutable.Map())
      .map((block) => block.set('firstLevelBlocks', block.get('firstLevelBlocks').reverse()));
  }

  getBlockChildren(key: string): BlockMap {
    return this.getBlockMap()
    .filter(function(block) {
      return block.getParentKey() === key;
    });
  }

  getKeyBefore(key: string): ?string {
    return this.getBlockMap()
      .reverse()
      .keySeq()
      .skipUntil(v => v === key)
      .skip(1)
      .first();
  }

  getKeyAfter(key: string): ?string {
    return this.getBlockMap()
      .keySeq()
      .skipUntil(v => v === key)
      .skip(1)
      .first();
  }

  getBlockAfter(key: string): ?ContentBlock {
    return this.getBlockMap()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlockBefore(key: string): ?ContentBlock {
    return this.getBlockMap()
      .reverse()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlocksAsArray(): Array<ContentBlock> {
    return this.getBlockMap().toArray();
  }

  getFirstBlock(): ContentBlock {
    return this.getBlockMap().first();
  }

  getLastBlock(): ContentBlock {
    return this.getBlockMap().last();
  }

  getPlainText(delimiter?: string): string {
    return this.getBlockMap()
      .map(block => {
        return block ? block.getText() : '';
      })
      .join(delimiter || '\n');
  }

  hasText(): boolean {
    var blockMap = this.getBlockMap();
    return (
      blockMap.size > 1 ||
      blockMap.first().getLength() > 0
    );
  }

  static createFromBlockArray(
    blocks: Array<ContentBlock>
  ): ContentState {
    var blockMap = BlockMapBuilder.createFromArray(blocks);
    var selectionState = SelectionState.createEmpty(blockMap.first().getKey());
    return new ContentState({
      blockMap,
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
  }

  static createFromText(
    text: string,
    delimiter: string | RegExp = /\r\n?|\n/g,
  ): ContentState {
    const strings = text.split(delimiter);
    const blocks = strings.map(
      block => {
        block = sanitizeDraftText(block);
        return new ContentBlock({
          key: generateRandomKey(),
          text: block,
          type: 'unstyled',
          characterList: List(Repeat(CharacterMetadata.EMPTY, block.length)),
        });
      }
    );
    return ContentState.createFromBlockArray(blocks);
  }
}

module.exports = ContentState;
