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
 * @emails oncall+draft_js
 */

'use strict';

const SelectionsCompareResultKeys = {
  OVERLAP: true,
  INSIDE: true,
  OUTSIDE: true,
  LEFT: true,
  RIGHT: true,
  EQUAL: true,
  UNKNOWN: true,
};
/**
 * An enum representing the compare result between two selections.
 *
 * 'OVERLAP' - selections overlaps
 * 'INSIDE' - current selection in inside of another selection
 * 'OUTSIDE' - current selection in outside of another selection
 * 'LEFT' - current selection is before another
 * 'RIGHT' - current selection is after another
 * 'EQUAL' - selections are equal
 * 'UNKNOWN' - can't compare
 */
type SelectionsCompareResult = $Keys<typeof SelectionsCompareResultKeys>;

type Position = {key: string, offset: number};
import type {BlockMap} from 'BlockMap';
const Immutable = require('immutable');
const {Record} = Immutable;

const defaultRecord: {
  anchorKey: string,
  anchorOffset: number,
  focusKey: string,
  focusOffset: number,
  isBackward: boolean,
  hasFocus: boolean,
} = {
  anchorKey: '',
  anchorOffset: 0,
  focusKey: '',
  focusOffset: 0,
  isBackward: false,
  hasFocus: false,
};

const SelectionStateRecord = Record(defaultRecord);

class SelectionState extends SelectionStateRecord {
  serialize(): string {
    return (
      'Anchor: ' +
      this.getAnchorKey() +
      ':' +
      this.getAnchorOffset() +
      ', ' +
      'Focus: ' +
      this.getFocusKey() +
      ':' +
      this.getFocusOffset() +
      ', ' +
      'Is Backward: ' +
      String(this.getIsBackward()) +
      ', ' +
      'Has Focus: ' +
      String(this.getHasFocus())
    );
  }

  getAnchorKey(): string {
    return this.get('anchorKey');
  }

  getAnchorOffset(): number {
    return this.get('anchorOffset');
  }

  getFocusKey(): string {
    return this.get('focusKey');
  }

  getFocusOffset(): number {
    return this.get('focusOffset');
  }

  getIsBackward(): boolean {
    return this.get('isBackward');
  }

  getHasFocus(): boolean {
    return this.get('hasFocus');
  }

  /**
   * Return whether the specified range overlaps with an edge of the
   * SelectionState.
   */
  hasEdgeWithin(blockKey: string, start: number, end: number): boolean {
    const anchorKey = this.getAnchorKey();
    const focusKey = this.getFocusKey();

    if (anchorKey === focusKey && anchorKey === blockKey) {
      const selectionStart = this.getStartOffset();
      const selectionEnd = this.getEndOffset();
      return (
        (start <= selectionStart && selectionStart <= end) || // selectionStart is between start and end, or
        (start <= selectionEnd && selectionEnd <= end) // selectionEnd is between start and end
      );
    }

    if (blockKey !== anchorKey && blockKey !== focusKey) {
      return false;
    }

    const offsetToCheck =
      blockKey === anchorKey ? this.getAnchorOffset() : this.getFocusOffset();

    return start <= offsetToCheck && end >= offsetToCheck;
  }

  isCollapsed(): boolean {
    return (
      this.getAnchorKey() === this.getFocusKey() &&
      this.getAnchorOffset() === this.getFocusOffset()
    );
  }

  getStartKey(): string {
    return this.getIsBackward() ? this.getFocusKey() : this.getAnchorKey();
  }

  getStartOffset(): number {
    return this.getIsBackward()
      ? this.getFocusOffset()
      : this.getAnchorOffset();
  }

  getEndKey(): string {
    return this.getIsBackward() ? this.getAnchorKey() : this.getFocusKey();
  }

  getEndOffset(): number {
    return this.getIsBackward()
      ? this.getAnchorOffset()
      : this.getFocusOffset();
  }

  static createEmpty(key: string): SelectionState {
    return new SelectionState({
      anchorKey: key,
      anchorOffset: 0,
      focusKey: key,
      focusOffset: 0,
      isBackward: false,
      hasFocus: false,
    });
  }

  /**
   * Compare current selection with another selection
   */
  compareWithSelection(
    sel2: SelectionState,
    blockMap: BlockMap,
  ): SelectionsCompareResult {
    let sel1 = this;
    let s1Start = {key: sel1.getStartKey(), offset: sel1.getStartOffset()};
    let s1End = {key: sel1.getEndKey(), offset: sel1.getEndOffset()};
    let s2Start = {key: sel2.getStartKey(), offset: sel2.getStartOffset()};
    let s2End = {key: sel2.getEndKey(), offset: sel2.getEndOffset()};

    let isOkDirection =
      comparePositions(s1Start, s1End, blockMap) <= 0 &&
      comparePositions(s2Start, s2End, blockMap) <= 0;
    let areEqual =
      s1Start.key == s2Start.key &&
      s1Start.offset == s2Start.offset &&
      s1End.key == s2End.key &&
      s1End.offset == s2End.offset;

    let s1Start_to_s2Start = comparePositions(s1Start, s2Start, blockMap);
    let s1End_to_s2Start = comparePositions(s1End, s2Start, blockMap);
    let s1Start_to_s2End = comparePositions(s1Start, s2End, blockMap);
    let s1End_to_s2End = comparePositions(s1End, s2End, blockMap);

    let isOverlap =
      (s1Start_to_s2Start > 0 && s1Start_to_s2End < 0 && s1End_to_s2End > 0) ||
      (s1Start_to_s2Start < 0 && s1End_to_s2Start > 0 && s1End_to_s2End < 0);
    let isS1Outside = s1Start_to_s2Start <= 0 && s1End_to_s2End >= 0;
    let isS1Inside = s1Start_to_s2Start >= 0 && s1End_to_s2End <= 0;
    let isS1ToRight = s1Start_to_s2End >= 0;
    let isS1ToLeft = s1End_to_s2Start <= 0;

    let rel = !isOkDirection
      ? 'UNKNOWN'
      : areEqual
        ? 'EQUAL'
        : isOverlap
          ? 'OVERLAP'
          : isS1Outside
            ? 'OUTSIDE'
            : isS1Inside
              ? 'INSIDE'
              : isS1ToRight
                ? 'RIGHT'
                : isS1ToLeft
                  ? 'LEFT'
                  : 'UNKNOWN';

    return rel;
  }

  /**
   * Fix current selection after deletion of selection `selDel`
   */
  updateOnDeletingSelection(
    selDel: SelectionState,
    blockMap: BlockMap,
  ): SelectionState {
    let startKey = this.getStartKey();
    let startOffset = this.getStartOffset();
    let endKey = this.getEndKey();
    let endOffset = this.getEndOffset();

    let newStartPos = fixPosOnDeletingSelection(
      {key: startKey, offset: startOffset},
      selDel,
      blockMap,
    );
    startKey = newStartPos.key;
    startOffset = newStartPos.offset;
    let newEndPos = fixPosOnDeletingSelection(
      {key: endKey, offset: endOffset},
      selDel,
      blockMap,
    );
    endKey = newEndPos.key;
    endOffset = newEndPos.offset;

    let selection = SelectionState.createEmpty(startKey).merge({
      anchorKey: startKey,
      anchorOffset: startOffset,
      focusKey: endKey,
      focusOffset: endOffset,
    });
    return selection;
  }
}

function fixPosOnDeletingSelection(
  pos: Position,
  selDel: SelectionState,
  blockMap: BlockMap,
): Position {
  pos = Object.assign({}, pos);
  let isSelectionOnSingleBlock = selDel.getStartKey() == selDel.getEndKey();
  let cmp = comparePositionWithSelection(pos, selDel, blockMap);
  if (cmp == 'INSIDE') {
    //position is inside of selection to delete
    pos.key = selDel.getStartKey();
    pos.offset = selDel.getStartOffset();
  } else if (cmp == 'LEFT') {
    //position is before selection to delete
    //safe
  } else if (cmp == 'RIGHT') {
    //position is after selection to delete
    if (isSelectionOnSingleBlock) {
      if (pos.key == selDel.getEndKey()) {
        pos.offset -= selDel.getEndOffset() - selDel.getStartOffset();
      }
    } else if (pos.key == selDel.getEndKey()) {
      pos.key = selDel.getStartKey();
      pos.offset = selDel.getStartOffset() + pos.offset - selDel.getEndOffset();
    }
  }

  return pos;
}

function comparePositionWithSelection(
  pos1: Position,
  sel2: SelectionState,
  blockMap: BlockMap,
): SelectionsCompareResult {
  let sel1 = SelectionState.createEmpty(pos1.key).merge({
    anchorKey: pos1.key,
    anchorOffset: pos1.offset,
    focusKey: pos1.key,
    focusOffset: pos1.offset,
  });
  return sel1.compareWithSelection(sel2, blockMap);
}

function comparePositions(
  pos1: Position,
  pos2: Position,
  blockMap: BlockMap,
): number {
  let ind1 = blockMap.keySeq().findIndex(k => k == pos1.key);
  let ind2 = blockMap.keySeq().findIndex(k => k == pos2.key);
  return ind1 == ind2 ? pos1.offset - pos2.offset : ind1 - ind2;
}

module.exports = SelectionState;
