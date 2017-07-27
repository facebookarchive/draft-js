/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+ui_infra
 */

'use strict';

jest.disableAutomock();

var SelectionState = require('SelectionState');

var COLLAPSED = {
  anchorKey: 'a',
  anchorOffset: 0,
  focusKey: 'a',
  focusOffset: 0,
  isBackward: false,
  hasFocus: true,
};

var WITHIN_BLOCK = {
  anchorKey: 'a',
  anchorOffset: 10,
  focusKey: 'a',
  focusOffset: 20,
  isBackward: false,
  hasFocus: true,
};

var MULTIBLOCK = {
  anchorKey: 'b',
  anchorOffset: 10,
  focusKey: 'c',
  focusOffset: 15,
  isBackward: false,
  hasFocus: true,
};

function getSample(config) {
  return new SelectionState(config);
}

function verifyValues(state, values) {
  var {
    anchorKey,
    anchorOffset,
    focusKey,
    focusOffset,
    isBackward,
    hasFocus,
  } = values;

  expect(state.getAnchorKey()).toBe(anchorKey);
  expect(state.getAnchorOffset()).toBe(anchorOffset);
  expect(state.getFocusKey()).toBe(focusKey);
  expect(state.getFocusOffset()).toBe(focusOffset);
  expect(state.getIsBackward()).toBe(isBackward);
  expect(state.getHasFocus()).toBe(hasFocus);
}

describe('SelectionState', () => {
  describe('creation and retrieval', () => {
    it('must create a new instance', () => {
      var state = getSample(COLLAPSED);
      expect(state instanceof SelectionState).toBe(true);
    });

    it('must retrieve properties correctly', () => {
      var state = getSample(COLLAPSED);
      verifyValues(state, COLLAPSED);
    });
  });

  describe('hasEdgeWithin', () => {
    it('is false for non-edge block keys', () => {
      expect(getSample(COLLAPSED).hasEdgeWithin('b', 0, 0)).toBe(false);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('b', 0, 0)).toBe(false);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('d', 0, 0)).toBe(false);
    });

    it('is false if offset is outside the selection range', () => {
      expect(getSample(COLLAPSED).hasEdgeWithin('a', 1, 1)).toBe(false);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 1, 1)).toBe(false);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('b', 1, 1)).toBe(false);
    });

    it('is true if key match and offset equals selection edge', () => {
      expect(getSample(COLLAPSED).hasEdgeWithin('a', 0, 1)).toBe(true);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 10, 15)).toBe(true);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 15, 20)).toBe(true);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('b', 10, 20)).toBe(true);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('c', 15, 20)).toBe(true);
    });

    it('is true if selection range is entirely within test range', () => {
      expect(
        getSample({...COLLAPSED, anchorOffset: 5, focusOffset: 5})
          .hasEdgeWithin('a', 0, 10),
      ).toBe(true);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 0, 40)).toBe(true);
    });

    it('is true if selection range edge overlaps test range', () => {
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 5, 15)).toBe(true);
      expect(getSample(WITHIN_BLOCK).hasEdgeWithin('a', 15, 25)).toBe(true);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('b', 5, 20)).toBe(true);
      expect(getSample(MULTIBLOCK).hasEdgeWithin('c', 5, 20)).toBe(true);
    });
  });

  describe('isCollapsed', () => {
    it('works properly', () => {
      expect(getSample(COLLAPSED).isCollapsed()).toBe(true);
      expect(getSample(WITHIN_BLOCK).isCollapsed()).toBe(false);
      expect(getSample(MULTIBLOCK).isCollapsed()).toBe(false);
    });
  });

  describe('start and end retrieval', () => {
    function flip(selectionState) {
      return selectionState.merge({
        anchorKey: selectionState.getFocusKey(),
        anchorOffset: selectionState.getFocusOffset(),
        focusKey: selectionState.getAnchorKey(),
        focusOffset: selectionState.getAnchorOffset(),
        isBackward: !selectionState.getIsBackward(),
      });
    }

    it('properly identifies start and end keys', () => {
      expect(getSample(COLLAPSED).getStartKey()).toBe('a');
      expect(getSample(WITHIN_BLOCK).getStartKey()).toBe('a');
      expect(getSample(MULTIBLOCK).getStartKey()).toBe('b');
      expect(getSample(COLLAPSED).getEndKey()).toBe('a');
      expect(getSample(WITHIN_BLOCK).getEndKey()).toBe('a');
      expect(getSample(MULTIBLOCK).getEndKey()).toBe('c');
    });

    it('properly identifies start and end offsets', () => {
      expect(getSample(COLLAPSED).getStartOffset()).toBe(0);
      expect(getSample(WITHIN_BLOCK).getStartOffset()).toBe(10);
      expect(getSample(MULTIBLOCK).getStartOffset()).toBe(10);
      expect(getSample(COLLAPSED).getEndOffset()).toBe(0);
      expect(getSample(WITHIN_BLOCK).getEndOffset()).toBe(20);
      expect(getSample(MULTIBLOCK).getEndOffset()).toBe(15);
    });

    it('properly identifies start end end keys when backward', () => {
      var withinBlock = flip(getSample(WITHIN_BLOCK));
      var multiBlock = getSample({...MULTIBLOCK, isBackward: true});
      expect(withinBlock.getStartKey()).toBe('a');
      expect(multiBlock.getStartKey()).toBe('c');
      expect(withinBlock.getEndKey()).toBe('a');
      expect(multiBlock.getEndKey()).toBe('b');
    });

    it('properly identifies start end end offsets when backward', () => {
      var withinBlock = flip(getSample(WITHIN_BLOCK));
      var multiBlock = getSample({...MULTIBLOCK, isBackward: true});
      expect(withinBlock.getStartOffset()).toBe(10);
      expect(multiBlock.getStartOffset()).toBe(15);
      expect(withinBlock.getEndOffset()).toBe(20);
      expect(multiBlock.getEndOffset()).toBe(10);
    });
  });

});
