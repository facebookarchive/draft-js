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

jest.disableAutomock();

var Immutable = require('immutable');
var getEntityKeyForSelection = require('getEntityKeyForSelection');
var getSampleStateForTesting = require('getSampleStateForTesting');
var matchers = require('jest-immutable-matchers');

var {contentState, selectionState} = getSampleStateForTesting();

selectionState = selectionState.merge({
  anchorKey: 'b',
  focusKey: 'b',
});

function setEntityMutability(mutability) {
  contentState.getEntityMap().get = () => ({
    getMutability: () => mutability,
  });
}
describe('getEntityKeyForSelection', () => {
  beforeEach(function() {
    jest.addMatchers(matchers);
  });

  describe('collapsed selection', () => {
    var collapsed = selectionState.merge({
      anchorOffset: 2,
      focusOffset: 2,
    });

    it('must return null at start of block', () => {
      var key = getEntityKeyForSelection(contentState, selectionState);
      expect(key).toBe(null);
    });

    it('must return key if mutable', () => {
      setEntityMutability('MUTABLE');
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toEqualImmutable(Immutable.OrderedSet.of('123'));
    });

    it('must not return key if immutable', () => {
      setEntityMutability('IMMUTABLE');
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toEqualImmutable(Immutable.OrderedSet());
    });

    it('must not return key if segmented', () => {
      setEntityMutability('SEGMENTED');
      var key = getEntityKeyForSelection(contentState, collapsed);
      expect(key).toEqualImmutable(Immutable.OrderedSet());
    });
  });

  describe('non-collapsed selection', () => {
    var nonCollapsed = selectionState.merge({
      anchorOffset: 2,
      focusKey: 'c',
      focusOffset: 2,
    });

    it('must return null if start is at end of block', () => {
      var startsAtEnd = nonCollapsed.merge({
        anchorOffset: contentState.getBlockForKey('b').getLength(),
      });
      var key = getEntityKeyForSelection(contentState, startsAtEnd);
      expect(key).toBe(Immutable.OrderedSet());
    });

    it('must return key if mutable', () => {
      setEntityMutability('MUTABLE');
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toEqualImmutable(Immutable.OrderedSet.of('123'));
    });

    it('must not return key if immutable', () => {
      setEntityMutability('IMMUTABLE');
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toBe(Immutable.OrderedSet());
    });

    it('must not return key if segmented', () => {
      setEntityMutability('SEGMENTED');
      var key = getEntityKeyForSelection(contentState, nonCollapsed);
      expect(key).toBe(Immutable.OrderedSet());
    });
  });
});
