/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ContentState
 * @format
 * @flow
 */

'use strict';

import type {BlockMap} from 'BlockMap';
import type {BlockNodeRecord} from 'BlockNodeRecord';
import type DraftEntityInstance from 'DraftEntityInstance';
import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';
import type {DraftInlineStyle} from 'DraftInlineStyle';

const BlockMapBuilder = require('BlockMapBuilder');
const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const DraftEntity = require('DraftEntity');
const DraftFeatureFlags = require('DraftFeatureFlags');
const Immutable = require('immutable');
const SelectionState = require('SelectionState');

const generateRandomKey = require('generateRandomKey');
const sanitizeDraftText = require('sanitizeDraftText');

const {List, Record, Repeat, OrderedSet} = Immutable;

const experimentalTreeDataSupport = DraftFeatureFlags.draft_tree_data_support;

const defaultRecord: {
  entityMap: ?any,
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
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity;
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
    var block: BlockNodeRecord = this.getBlockMap().get(key);
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
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity.__getLastCreatedEntityKey();
  }

  hasText(): boolean {
    var blockMap = this.getBlockMap();
    return blockMap.size > 1 || blockMap.first().getLength() > 0;
  }

  createEntity(
    type: DraftEntityType,
    mutability: DraftEntityMutability,
    data?: Object,
  ): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__create(type, mutability, data);
    return this;
  }

  mergeEntityData(key: string, toMerge: {[key: string]: any}): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__mergeData(key, toMerge);
    return this;
  }

  replaceEntityData(key: string, newData: {[key: string]: any}): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__replaceData(key, newData);
    return this;
  }

  addEntity(instance: DraftEntityInstance): ContentState {
    // TODO: update this when we fully remove DraftEntity
    DraftEntity.__add(instance);
    return this;
  }

  getEntity(key: string): DraftEntityInstance {
    // TODO: update this when we fully remove DraftEntity
    return DraftEntity.__get(key);
  }

  getInlineStyleForSelection(selection: SelectionState): DraftInlineStyle {
    if (selection.isCollapsed()) {
      return getInlineStyleForCollapsedSelection(this, selection);
    } else {
      return getInlineStyleForNonCollapsedSelection(this, selection);
    }
  }

  getCommonInlineStyleForSelection(
    selection: SelectionState,
  ): DraftInlineStyle {
    if (selection.isCollapsed()) {
      return getInlineStyleForCollapsedSelection(this, selection);
    } else {
      const {commonStyles} = getInlineStyleForNonCollapsedSelectionExt(
        this,
        selection,
      );
      return commonStyles;
    }
  }

  getUnionInlineStyleForSelection(selection: SelectionState): DraftInlineStyle {
    if (selection.isCollapsed()) {
      return getInlineStyleForCollapsedSelection(this, selection);
    } else {
      const {foundStyles} = getInlineStyleForNonCollapsedSelectionExt(
        this,
        selection,
      );
      return foundStyles;
    }
  }

  static createFromBlockArray(
    // TODO: update flow type when we completely deprecate the old entity API
    blocks: Array<BlockNodeRecord> | {contentBlocks: Array<BlockNodeRecord>},
    entityMap: ?any,
  ): ContentState {
    // TODO: remove this when we completely deprecate the old entity API
    const theBlocks = Array.isArray(blocks) ? blocks : blocks.contentBlocks;
    var blockMap = BlockMapBuilder.createFromArray(theBlocks);
    var selectionState = blockMap.isEmpty()
      ? new SelectionState()
      : SelectionState.createEmpty(blockMap.first().getKey());
    return new ContentState({
      blockMap,
      entityMap: entityMap || DraftEntity,
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

function getInlineStyleForCollapsedSelection(
  content: ContentState,
  selection: SelectionState,
): DraftInlineStyle {
  var startKey = selection.getStartKey();
  var startOffset = selection.getStartOffset();
  var startBlock = content.getBlockForKey(startKey);

  // If the cursor is not at the start of the block, look backward to
  // preserve the style of the preceding character.
  if (startOffset > 0) {
    return startBlock.getInlineStyleAt(startOffset - 1);
  }

  // The caret is at position zero in this block. If the block has any
  // text at all, use the style of the first character.
  if (startBlock.getLength()) {
    return startBlock.getInlineStyleAt(0);
  }

  // Otherwise, look upward in the document to find the closest character.
  return lookUpwardForInlineStyle(content, startKey);
}

function getInlineStyleForNonCollapsedSelection(
  content: ContentState,
  selection: SelectionState,
): DraftInlineStyle {
  var startKey = selection.getStartKey();
  var startOffset = selection.getStartOffset();
  var startBlock = content.getBlockForKey(startKey);

  // If there is a character just inside the selection, use its style.
  if (startOffset < startBlock.getLength()) {
    return startBlock.getInlineStyleAt(startOffset);
  }

  // Check if the selection at the end of a non-empty block. Use the last
  // style in the block.
  if (startOffset > 0) {
    return startBlock.getInlineStyleAt(startOffset - 1);
  }

  // Otherwise, look upward in the document to find the closest character.
  return lookUpwardForInlineStyle(content, startKey);
}

function lookUpwardForInlineStyle(
  content: ContentState,
  fromKey: string,
): DraftInlineStyle {
  var lastNonEmpty = content
    .getBlockMap()
    .reverse()
    .skipUntil((_, k) => k === fromKey)
    .skip(1)
    .skipUntil((block, _) => block.getLength())
    .first();

  if (lastNonEmpty)
    return lastNonEmpty.getInlineStyleAt(lastNonEmpty.getLength() - 1);
  return OrderedSet();
}

function getInlineStyleForNonCollapsedSelectionExt(
  content: ContentState,
  selection: SelectionState,
): {commonStyles: DraftInlineStyle, foundStyles: DraftInlineStyle} {
  let commonStyles = OrderedSet();
  let foundStyles = OrderedSet();
  const selStart = selection.getStartOffset();
  const selEnd = selection.getEndOffset();
  if (!selection.isCollapsed() && selStart >= 0 && selEnd >= 0) {
    const blockMap = content.getBlockMap();
    const blockKeys = Array.from(blockMap.keys());
    let blocksByKeys = {};
    blockMap.map(blk => {
      blocksByKeys[blk.key] = blk;
    });
    const selStartKeyInd = blockKeys.indexOf(selection.getStartKey());
    const selEndKeyInd = blockKeys.indexOf(selection.getEndKey());

    let stylesLengths = {};
    let selFullLength = 0;
    for (let ind = selStartKeyInd; ind <= selEndKeyInd; ind++) {
      const blockKey = blockKeys[ind];
      const block = blocksByKeys[blockKey];

      const chars = block.getCharacterList();
      const blockCharsCount = chars.count();
      let bsStart = 0;
      let bsEnd = blockCharsCount;
      if (ind == selStartKeyInd) bsStart = selStart;
      if (ind == selEndKeyInd) bsEnd = selEnd;
      const bsEndR = bsEnd - 1; //tip: 'R' means include last char, not exclude
      const bsLength = bsEnd - bsStart;
      selFullLength += bsLength;

      block.findStyleRanges(
        character => {
          const styleKeysSet = character.getStyle(); //OrderedSet
          return styleKeysSet !== null && styleKeysSet.size > 0;
        },
        (start, end) => {
          const endR = end - 1; //tip: 'R' means include last char, not exclude
          const isInSelection = !(
            (start < bsStart && endR < bsStart) ||
            (start > bsEndR && endR > bsEndR)
          );
          if (!isInSelection) return;
          const fStart = Math.max(start, bsStart);
          const fEnd = Math.min(end, bsEnd);
          //const fEndR = fEnd - 1;
          const len = fEnd - fStart;
          const stlSet = block.getInlineStyleAt(start);
          for (const stl of stlSet) {
            foundStyles = foundStyles.add(stl);
            if (!stylesLengths[stl]) stylesLengths[stl] = 0;
            stylesLengths[stl] += len;
          }
        },
      );
    }

    const commonStylesArr = Object.keys(stylesLengths).filter(
      stl => stylesLengths[stl] == selFullLength,
    );
    commonStyles = OrderedSet(commonStylesArr);
  }

  return {
    commonStyles,
    foundStyles,
  };
}

module.exports = ContentState;
