/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails isaac, oncall+ui_infra
 */

jest.autoMockOff();

jest.mock('DraftEntity');

var getEntityKeyForSelection = require('getEntityKeyForSelection');
var getSampleStateForTesting = require('getSampleStateForTesting');

var {
  contentState,
  selectionState,
} = getSampleStateForTesting();

selectionState = selectionState.merge({
  anchorKey: 'b',
  focusKey: 'b',
});

var DraftEntity = require('DraftEntity');

describe('getEntityKeyForSelection', () => {
  describe('collapsed selection', () => {
    var collapsed = selectionState.merge({
      anchorOffset: 2,
      focusOffset: 2,
    });

    beforeEach(() => {
      DraftEntity.get.mockClear();
    });

    it('must return null at start of block', () => {
      var key = getEntityKeyForSelection(contentState, selectionState);
      expect(key).toBe(null);
    });

    it('must return key if mutable', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'MUTABLE'};
      });
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toBe('123');
    });

    it('must not return key if immutable', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'IMMUTABLE'};
      });
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toBe(null);
    });

    it('must not return key if segmented', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'SEGMENTED'};
      });
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toBe(null);
    });
  });

  describe('non-collapsed selection', () => {
    var nonCollapsed = selectionState.merge({
      anchorOffset: 2,
      focusKey: 'c',
      focusOffset: 2,
    });

    beforeEach(() => {
      DraftEntity.get.mockClear();
    });

    it('must return null if start is at end of block', () => {
      var startsAtEnd = nonCollapsed.merge({
        anchorOffset: contentState.getBlockForKey('b').getLength(),
      });
      var key = getEntityKeyForSelection(contentState, startsAtEnd);
      expect(key).toBe(null);
    });

    it('must return key if mutable', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'MUTABLE'};
      });
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toBe('123');
    });

    it('must not return key if immutable', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'IMMUTABLE'};
      });
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toBe(null);
    });

    it('must not return key if segmented', () => {
      DraftEntity.get.mockImplementation(() => {
        return {getMutability: () => 'SEGMENTED'};
      });
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toBe(null);
    });
  });
});
