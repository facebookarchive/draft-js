/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {EntityMap} from 'EntityMap';
import type DraftEntityInstance from 'DraftEntityInstance';
import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const DraftEntity = require('DraftEntity');
const Immutable = require('immutable');
const SelectionState = require('SelectionState');

const addEntityToContentState = require('addEntityToContentState');
const createEntityInContentState = require('createEntityInContentState');
const invariant = require('invariant');
const generateRandomKey = require('generateRandomKey');
const gkx = require('gkx');
const sanitizeDraftText = require('sanitizeDraftText');
const updateEntityDataInContentState = require('updateEntityDataInContentState');

const {List, Record, Repeat, OrderedMap} = Immutable;

const experimentalTreeDataSupport = gkx('draft_tree_data_support');

const defaultRecord: {
  entityMap: ?EntityMap,
  blockMap: ?BlockMap,
  selectionBefore: ?SelectionState,
  selectionAfter: ?SelectionState,
} = {
  entityMap: null,
  blockMap: null,
  selectionBefore: null,
  selectionAfter: null,
};

const ContentBlockNodeRecord = experimentalTreeDataSupport
  ? ContentBlockNode
  : ContentBlock;

const ContentStateRecord = Record(defaultRecord);

class ContentState extends ContentStateRecord {
  getEntityMap(): any {
    return this.get('entityMap');
  }

  getBlockMap(): BlockMap {
    return this.get('blockMap');
  }

  getSelectionBefore(): SelectionState {
    return this.get('selectionBefore');
  }

  getSelectionAfter(): SelectionState {
    return this.get('selectionAfter');
  }

  getBlockForKey(key: string): BlockNodeRecord {
    const block: BlockNodeRecord = this.getBlockMap().get(key);
    return block;
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

  getBlockAfter(key: string): ?BlockNodeRecord {
    return this.getBlockMap()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlockBefore(key: string): ?BlockNodeRecord {
    return this.getBlockMap()
      .reverse()
      .skipUntil((_, k) => k === key)
      .skip(1)
      .first();
  }

  getBlocksAsArray(): Array<BlockNodeRecord> {
    return this.getBlockMap().toArray();
  }

  getFirstBlock(): BlockNodeRecord {
    return this.getBlockMap().first();
  }

  getLastBlock(): BlockNodeRecord {
    return this.getBlockMap().last();
  }

  getPlainText(delimiter?: string): string {
    return this.getBlockMap()
      .map(block => {
        return block ? block.getText() : '';
      })
      .join(delimiter || '\n');
  }

  getLastCreatedEntityKey() {
    return this.getEntityMap()
      .keySeq()
      .last();
  }

  hasText(): boolean {
    const blockMap = this.getBlockMap();
    return blockMap.size > 1 || blockMap.first().getLength() > 0;
  }

  createEntity(
    type: DraftEntityType,
    mutability: DraftEntityMutability,
    data?: Object,
  ): ContentState {
    return createEntityInContentState(this, type, mutability, data);
  }

  mergeEntityData(key: string, toMerge: {[key: string]: any}): ContentState {
    return updateEntityDataInContentState(this, key, toMerge, true);
  }

  replaceEntityData(key: string, newData: {[key: string]: any}): ContentState {
    return updateEntityDataInContentState(this, key, newData, false);
  }

  addEntity(instance: DraftEntityInstance): ContentState {
    return addEntityToContentState(this, instance);
  }

  getEntity(key: string): DraftEntityInstance {
    const instance = this.getEntityMap().get(key);
    invariant(!!instance, 'Unknown DraftEntity Key.');
    return instance;
  }

  static createFromBlockArray(
    blocks: Array<BlockNodeRecord> | {contentBlocks: Array<BlockNodeRecord>},
    entityMap: ?OrderedMap,
  ): ContentState {
    const theBlocks = Array.isArray(blocks) ? blocks : blocks.contentBlocks;
    const blockMap = BlockMapBuilder.createFromArray(theBlocks);
    const selectionState = blockMap.isEmpty()
      ? new SelectionState()
      : SelectionState.createEmpty(blockMap.first().getKey());
    return new ContentState({
      blockMap,
      entityMap: entityMap || OrderedMap(),
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
  }

  static createFromText(
    text: string,
    delimiter: string | RegExp = /\r\n?|\n/g,
  ): ContentState {
    const strings = text.split(delimiter);
    const blocks = strings.map(block => {
      block = sanitizeDraftText(block);
      return new ContentBlockNodeRecord({
        key: generateRandomKey(),
        text: block,
        type: 'unstyled',
        characterList: List(Repeat(CharacterMetadata.EMPTY, block.length)),
      });
    });
    return ContentState.createFromBlockArray(blocks);
  }
}

module.exports = ContentState;
