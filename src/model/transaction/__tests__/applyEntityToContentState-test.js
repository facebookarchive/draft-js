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

var Immutable = require('immutable');
var SelectionState = require('SelectionState');

var applyEntityToContentState = require('applyEntityToContentState');
var getSampleStateForTesting = require('getSampleStateForTesting');
var matchers = require('jest-immutable-matchers');

describe('applyEntityToContentState', () => {
  beforeEach(function() {
    jest.addMatchers(matchers);
  });

  var {contentState} = getSampleStateForTesting();

  function checkForCharacterList(block) {
    expect(Immutable.List.isList(block.getCharacterList())).toBe(true);
  }

  function getEntities(block) {
    return block.getCharacterList().map(c => c.getEntity());
  }

  describe('Apply entity within single block', () => {
    var target = contentState.getBlockMap().first();
    var targetSelection = new SelectionState({
      anchorKey: target.getKey(),
      anchorOffset: 0,
      focusKey: target.getKey(),
      focusOffset: target.getLength(),
    });

    function applyAndCheck(entityKey, add) {
      var withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey,
        add,
      );
      var first = withNewEntity.getBlockMap().first();

      var expectedKeys = Immutable.OrderedSet();
      if (add) {
        expectedKeys = expectedKeys.add(entityKey);
      }

      checkForCharacterList(first);
      expect(getEntities(first)).toEqualImmutable(
        Immutable.Repeat(expectedKeys, first.getLength()).toList(),
      );
    }

    it('must apply entity key', () => {
      applyAndCheck('x', true);
    });

    it('must apply null entity', () => {
      applyAndCheck('x', false);
    });
  });

  describe('Apply entity across multiple blocks', () => {
    var blockMap = contentState.getBlockMap();
    var first = blockMap.first();
    var last = contentState.getBlockAfter(first.getKey());

    var targetSelection = new SelectionState({
      anchorKey: first.getKey(),
      anchorOffset: 0,
      focusKey: last.getKey(),
      focusOffset: last.getLength(),
    });

    function applyAndCheck(entityKey, add) {
      var withNewEntity = applyEntityToContentState(
        contentState,
        targetSelection,
        entityKey,
        add,
      );
      var first = withNewEntity.getBlockMap().first();
      var last = withNewEntity.getBlockAfter(first.getKey());

      var expectedKeys = Immutable.OrderedSet();
      if (add) {
        expectedKeys = expectedKeys.add(entityKey);
      }

      checkForCharacterList(first);
      expect(getEntities(first)).toEqualImmutable(
        Immutable.Repeat(expectedKeys, first.getLength()).toList(),
      );

      expectedKeys = Immutable.OrderedSet.of('123');
      if (add) {
        expectedKeys = expectedKeys.add(entityKey);
      }
      checkForCharacterList(last);
      expect(getEntities(last)).toEqualImmutable(
        Immutable.Repeat(expectedKeys, last.getLength()).toList(),
      );
    }

    it('must apply entity key', () => {
      applyAndCheck('x', true);
    });

    it('must remove x entity', () => {
      applyAndCheck('x', false);
    });
  });
});
